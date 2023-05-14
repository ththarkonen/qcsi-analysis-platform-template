#include <stdlib.h>
#include <string>
#include <vector>
#include <omp.h>
#include <armadillo>
#include <chrono>

#include "lineNarrowingHelpers.hpp"
#include "../../common/json/jsonutils.hpp"
#include "../../common/math/smcHelpers.hpp"
#include "../../common/json/json.hpp"

using json = nlohmann::json;
using namespace std;

mat computeMeanLineNarrowedSpectrum( const mat& yData, const vector<json>& resultObjects ){

  const int nParticles = resultObjects.size();

  const double area = accu( yData );
  double tempArea;
  double factor;

  json resultObject = resultObjects[0];
  mat tempResult = json2mat( resultObject["result"] );

  int nData = tempResult.n_rows;
  double nDataDouble = (double) nData;

  mat meanResult = zeros( nData, 1);

  for(int ii = 0; ii < nParticles; ii++){

    resultObject = resultObjects[ii];

    tempResult = json2mat( resultObject["result"] );
    tempResult = clamp( tempResult, 0.0, datum::inf);

    tempArea = accu( tempResult );
    factor = area / tempArea;
    tempResult = factor * tempResult;

    meanResult = meanResult + tempResult;
  };

  meanResult = meanResult / nDataDouble;
  return meanResult;
};

int mcmcUpdate( mat& particles, vector<json>& resultObjects, json& smcObject){

  const int nParticles = particles.n_rows;
  const int nParameters = particles.n_cols;

  const mat randMat = randn( nParticles, nParameters);

  const double kappa = smcObject["kappa"].get<double>();
  const string mode = smcObject["mode"].get<string>();
  const json priors = smcObject["priors"];

  const mat proposalMat = json2mat( smcObject["mcmcProposalMatrix"] );

  mat propParticles;

  if( mode == "lorentz" ){

    propParticles = randMat * proposalMat + particles;
    propParticles.col(1) = round( propParticles.col(1) );
  };

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

  const int nSteps = smcObject["numberOfStepsMCMC"].get<int>();

  const double targetAR = smcObject["targetAcceptanceRateMCMC"].get<double>();
  const double minESS = smcObject["minimumEffectiveSampleSize"].get<double>();

  const json priors = smcObject["priors"];

  double ESS = smcObject["numberOfParticles"].get<double>();

  vector<double> vectorKappa = { 0.0 };
  vector<double> vectorESS = { doubleN };
  vector<double> vectorAR = { targetAR };

  arma_rng::set_seed_random();

  cout << "Here 1" << "\n";
  cout.flush();

  vec weights = (1 / doubleN) * ones( N, 1);
  mat particles = samplePrior( N, priors );

  cout << "Here 1.5" << "\n";
  cout.flush();

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

    //cout << "Current kappa: " << smcObject["kappa"].get<double>() << "\n";
    //cout.flush();
    cout << smcObject["kappa"].get<double>() << "\n";
    cout.flush();

    vectorKappa.push_back( kappa );

    if( ESS < minESS ){

      weights = json2mat( smcObject["weights"] );
      resample( particles, resultObjects, weights);

      resampledTrue = true;

      weights = (1 / doubleN) * ones( N, 1);
      smcObject["weights"] = mat2json( weights );
      smcObject["ESS"] = doubleN;
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

        weights = json2mat( smcObject["weights"] );
        resample( particles, resultObjects, weights);

        resampledTrue = true;

        weights = (1 / doubleN) * ones( N, 1);
        smcObject["weights"] = mat2json( weights );
        smcObject["ESS"] = doubleN;
      };

      break;
    };
  };

  const mat yData = json2vec( smcObject["y"] );

  mat meanLnSpectrum = computeMeanLineNarrowedSpectrum( yData, resultObjects );
  mat gamma = particles.col(0);
  mat matN = particles.col(1);

  smcObject["particles"]["gamma"] = mat2json( gamma );
  smcObject["particles"]["N"] = mat2json( matN );
  smcObject["resultObjects"] = resultObjects;

  smcObject["meanLineNarrowedSpectrum"] = meanLnSpectrum;

  smcObject.erase("x");
  smcObject.erase("y");
  smcObject.erase("weights");
  smcObject.erase("mcmcProposalMatrix");
  smcObject.erase("acceptanceRate");
  smcObject.erase("kappa");
  smcObject.erase("mcmcMultiplier");

  return smcObject;
}
