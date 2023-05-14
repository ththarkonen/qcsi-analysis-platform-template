#include <stdlib.h>
#include <string>
#include <vector>
#include <omp.h>
#include <armadillo>
#include <chrono>

#include <iostream>
#include <fstream>
#include <sstream>
#include <streambuf>

#include "lorentzQuantumResonators.hpp"
#include "../../common/json/jsonutils.hpp"
#include "../../common/math/smcHelpers.hpp"
#include "../../common/json/json.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

int mcmcUpdate( mat& particles, vector<json>& resultObjects, json& smcObject){

  const int nParticles = particles.n_rows;
  const int nParameters = particles.n_cols;

  const mat randMat = randn( nParticles, nParameters);

  const double kappa = smcObject["kappa"].get<double>();

  const json priors = smcObject["priors"];

  const mat proposalMat = json2mat( smcObject["mcmcProposalMatrix"] );

  mat propParticles = randMat * proposalMat + particles;

  vec accepted = zeros(nParticles);

  vector<json> propResultObjects = computeModelLikelihood( propParticles, smcObject);

  mat ll = getLogLikelihoods( resultObjects );
  mat prop_ll = getLogLikelihoods( propResultObjects );

  mat logPrior = getLogPriorProbabilities( resultObjects );
  mat propLogPrior = getLogPriorProbabilities( propResultObjects );

  mat randomUniform = randu( nParticles, 1);

  #pragma omp parallel for
	for (int ii = 0; ii < nParticles; ii++) {

    double ll_ii = ll[ii];
    double prop_ll_ii = prop_ll[ii];

    double logPrior_ii = logPrior[ii];
    double propLogPrior_ii = propLogPrior[ii];

    double logLikelihoodRatio = kappa * prop_ll_ii;
    logLikelihoodRatio = logLikelihoodRatio + propLogPrior_ii;

    logLikelihoodRatio = logLikelihoodRatio - kappa * ll_ii;
    logLikelihoodRatio = logLikelihoodRatio - logPrior_ii;

    double logU_ii = log( randomUniform[ii] );

    if( logU_ii < logLikelihoodRatio ){

      particles.row(ii) = propParticles.row(ii);
      resultObjects[ii] = propResultObjects[ii];

      accepted[ii] = 1;
    };

  };

  int totalAccepted = accu( accepted );
  return totalAccepted;
};

json smcSampler( json& smcObject ){

  const int N = smcObject["numberOfParticles"].get<int>();
  const double doubleN = smcObject["numberOfParticles"].get<double>();
  const int nLineShapes = smcObject["nLineShapes"].get<int>();

  const int nSteps = smcObject["numberOfStepsMCMC"].get<int>();

  const double targetAR = smcObject["targetAcceptanceRateMCMC"].get<double>();
  const double minESS = smcObject["minimumEffectiveSampleSize"].get<double>();
  const string noiseSamplingMode = smcObject["noiseLevelSamplingMode"].get<string>();;

  const json priors = smcObject["priors"];

  double ESS = smcObject["numberOfParticles"].get<double>();

  vector<double> vectorKappa = { 0.0 };
  vector<double> vectorESS = { doubleN };
  vector<double> vectorAR = { targetAR };

  arma_rng::set_seed_random();

  vec weights = (1 / doubleN) * ones( N, 1);
  mat particles = samplePrior( N, priors );

  vector<json> resultObjects = computeModelLikelihood( particles, smcObject);

  int counter = 0;
  // MCMCM proposal multiplier
  double mcmcMP = 1.0;

  smcObject["kappa"] = 0;
  smcObject["ESS"] = ESS;
  smcObject["weights"] = mat2json( weights );
  smcObject["mcmcMultiplier"] = mcmcMP;

  double kappa;
  double ar;
  double amountAccepted;
  bool resampledTrue;

  cout << "Current kappa: " << smcObject["kappa"].get<double>() << "\n";
  cout.flush();
  cout << smcObject["kappa"].get<double>() << "\n";
  cout.flush();

  while(true){

    kappa = vectorKappa[counter];
    ESS = vectorESS[counter];
    ar = vectorAR[counter];

    resampledTrue = false;

    smcObject = weightTempering( resultObjects, smcObject);
    smcObject["acceptanceRate"] = ar;

    ESS = smcObject["ESS"].get<double>();
    kappa = smcObject["kappa"].get<double>();

    cout << smcObject["kappa"].get<double>() << "\n";
    cout.flush();

    vectorKappa.push_back( kappa );

    weights = json2mat( smcObject["weights"] );

    if( ESS < minESS ){

      weights = json2mat( smcObject["weights"] );
      resample( particles, resultObjects, weights);

      resampledTrue = true;

      weights = (1 / doubleN) * ones( N, 1);
      smcObject["weights"] = mat2json( weights );
      smcObject["ESS"] = doubleN;

      cout << "Resampled" << "\n";
    };

    smcObject = constructProposal( particles, smcObject);

    int tempAccepted = 0;
    amountAccepted = 0;

    auto t1 = std::chrono::high_resolution_clock::now();

    for( int ii = 0; ii < nSteps; ii++){

      tempAccepted = mcmcUpdate( particles, resultObjects, smcObject);
      amountAccepted = amountAccepted + tempAccepted;

      ar = (double) tempAccepted / doubleN;
      smcObject["acceptanceRate"] = ar;

      smcObject = constructProposal( particles, smcObject);

      cout << "MCMC iteration acceptance rate: " << ar << "\n";
    };
    auto t2 = std::chrono::high_resolution_clock::now();
    cout << "MCMC took "
            << std::chrono::duration_cast<std::chrono::milliseconds>(t2-t1).count()
            << " milliseconds\n";

    counter++;

    ar = (double) amountAccepted / (double) ( N * nSteps );
    ESS = smcObject["ESS"].get<double>();

    vectorAR.push_back( ar );
    vectorESS.push_back( ESS );

    cout << "Acceptance rate: " << ar << "\n";
    cout.flush();

    if( kappa >= 1 ){

      if( !resampledTrue ){

        resample( particles, resultObjects, weights);

        resampledTrue = true;

        weights = (1 / doubleN) * ones( N, 1);
        smcObject["weights"] = mat2json( weights );
        smcObject["ESS"] = doubleN;
      };

      break;
    };
  };

  const int nParameters = particles.n_cols;

  const mat amplitudes = returnAmplitudes( particles, nLineShapes);
  const mat locations = returnLocations( particles, nLineShapes);
  const mat gammas = returnGammas( particles, nLineShapes);

  const mat constantShifts = returnConstantShifts( particles, nLineShapes);
  const mat scales = returnScales( particles, nLineShapes);
  const mat backgroundParameters = returnBackgroundParameters( particles, nLineShapes);

  const mat totalQualityFactor = computeTotalQualityFactor( locations, gammas);
  const mat internalQualityFactor = computeInternalQualityFactor( totalQualityFactor, amplitudes);
  const mat couplingQualityFactor = computeCouplingQualityFactor( totalQualityFactor, amplitudes);

  mat s2;

  if( noiseSamplingMode == "sample" ){
    s2 = returnNoiseParameters( particles, nLineShapes);
    smcObject["particles"]["s2"] = mat2json( s2 );
  };

  particles.reset();

  const string baseA = "amplitude_";
  const string baseL = "location_";
  const string baseG = "gamma_";

  const string cShiftStr = "constantShift";
  const string scaleStr = "scale";
  const string bgParameterStr = "p";

  const string baseQtStr = "totalLoadedQualityFactor_";
  const string baseQiStr = "internalQualityFactor_";
  const string baseQcStr = "couplingQualityFactor_";

  string aStr;
  string lStr;
  string gStr;

  string qTotStr;
  string qIntStr;
  string qCouStr;

  string iiStr;

  for( int ii = 0; ii < nLineShapes; ii++ ){

    iiStr = to_string( ii + 1 );

    aStr = baseA + iiStr;
    lStr = baseL + iiStr;
    gStr = baseG + iiStr;

    qTotStr = baseQtStr + iiStr;
    qIntStr = baseQiStr + iiStr;
    qCouStr = baseQcStr + iiStr;

    smcObject["particles"][aStr] = mat2json( amplitudes.col( ii ) );
    smcObject["particles"][lStr] = mat2json( locations.col(ii) );
    smcObject["particles"][gStr] = mat2json( gammas.col(ii) );

    smcObject["particles"][qTotStr] = mat2json( totalQualityFactor.col( ii ) );
    smcObject["particles"][qIntStr] = mat2json( internalQualityFactor.col(ii) );
    smcObject["particles"][qCouStr] = mat2json( couplingQualityFactor.col(ii) );
  };

  smcObject["particles"][cShiftStr] = mat2json( constantShifts );
  smcObject["particles"][scaleStr] = mat2json( scales );
  smcObject["particles"][bgParameterStr] = mat2json( backgroundParameters );

  vec p = { 0.025, 0.50, 0.975 };

  mat modelQuantiles = computeQuantiles( resultObjects, "model", p);
  mat spectrumQuantiles = computeQuantiles( resultObjects, "spectrum", p);
  mat backgroundQuantiles = computeQuantiles( resultObjects, "background", p);

  smcObject["quantiles"]["model"] = mat2json( modelQuantiles );
  smcObject["quantiles"]["spectrum"] = mat2json( spectrumQuantiles );
  smcObject["quantiles"]["background"] = mat2json( backgroundQuantiles );

  smcObject["numberOfParameters"] = nParameters;
  smcObject["numberOfLineShapes"] = nLineShapes;

  smcObject.erase("kappa");
  smcObject.erase("weights");
  smcObject.erase("mcmcMultiplier");
  smcObject.erase("ESS");
  smcObject.erase("acceptanceRate");

  return smcObject;
}
