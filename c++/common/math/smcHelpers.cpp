#include <stdlib.h>
#include <string>
#include <vector>
#include <armadillo>
#include <omp.h>

#include "mathhelpers.hpp"
#include "../json/jsonutils.hpp"
#include "../json/json.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

mat samplePrior( const int nParticles, const json& priorJSON ){

  const int nParameters = priorJSON.size();

  mat particles = mat( nParticles, nParameters);

  cout << priorJSON << "\n";
  cout.flush();

  int ii = 0;
  for (auto prior : priorJSON){
      // "it" is of type json::reference and has no key() member

      mat parameters = json2vec( prior["parameters"] );

      if( prior["distribution"] == "normal" ){
        particles.col(ii) = sampleNormalDistribution( nParticles, parameters);
      }else if( prior["distribution"] == "uniform" ){
        particles.col(ii) = sampleUniformDistribution( nParticles, parameters);
      }else if( prior["distribution"] == "discreteuniform" ){
        particles.col(ii) = sampleDiscreteUniformDistribution( nParticles, parameters);
      }else if( prior["distribution"] == "halfnormal" ){
        particles.col(ii) = sampleHalfNormalDistribution( nParticles, parameters);
      };

      ii++;
  };

  return particles;
};

colvec computeLogPrior( const mat& particles, const json& priorJSON ){

  const int nParticles = particles.n_rows;
  colvec logPrior = colvec( nParticles );

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    const rowvec theta_ii = particles.row(ii);
    double logPrior_ii = 0;
    double tempPrior_ii = 1;

    int jj = 0;

    for (auto prior : priorJSON){

      double theta_jj = theta_ii[jj];
      mat parameters = json2vec( prior["parameters"] );

      if( prior["distribution"] == "normal" ){

        tempPrior_ii = computeNormalDistribution( theta_jj, parameters);
        logPrior_ii  += log( tempPrior_ii );
      }else if( prior["distribution"] == "uniform" ){

        tempPrior_ii = computeUniformDistribution( theta_jj, parameters);
        logPrior_ii += log( tempPrior_ii );
      } else if( prior["distribution"] == "discreteuniform" ){

        tempPrior_ii = computeDiscreteUniformDistribution( theta_jj, parameters);
        logPrior_ii += log( tempPrior_ii );
      } else if( prior["distribution"] == "halfnormal" ){

        tempPrior_ii = computeHalfNormalDistribution( theta_jj, parameters);
        logPrior_ii += log( tempPrior_ii );
      };

      jj++;
    };

    logPrior[ii] = logPrior_ii;
  };

  return logPrior;
};

mat computeQuantiles( const vector<json>& resultObjects, const string& field, const vec& percentages){

  const int nParticles = resultObjects.size();
  const int nData = json2mat( resultObjects[0][field] ).n_rows;

  mat data( nData, nParticles);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    json j = resultObjects[ii];
    data.col( ii ) = json2mat( j[field] );
  };

  mat quantiles = quantile( data, percentages, 1);
  return quantiles;
};

mat getLogLikelihoods( const vector<json>& resultObjects ){

  const int nParticles = resultObjects.size();
  mat ll( nParticles, 1);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    json j = resultObjects[ii];
    ll[ii] = j["logLikelihood"].get<double>();
  };

  return ll;
};

mat getLogPriorProbabilities( const vector<json>& resultObjects ){

  const int nParticles = resultObjects.size();
  mat logPriorProbabilities( nParticles, 1);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    json j = resultObjects[ii];
    logPriorProbabilities[ii] = j["logPriorProbability"].get<double>();
  };

  return logPriorProbabilities;
};

mat getLogPriorF( const vector<json>& resultObjects ){

  const int nParticles = resultObjects.size();
  mat logPriorProbabilities( nParticles, 1);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    json j = resultObjects[ii];
    logPriorProbabilities[ii] = j["logPriorF"].get<double>();
  };

  return logPriorProbabilities;
};

double computeESS( const mat& w ){

  double ESS = 1 / accu( w % w );
  return ESS;
};

json weightTempering( const vector<json>& resultObjects, json smcObject){

  const double alpha = smcObject["learningRate"].get<double>();

  double minKappa = smcObject["kappa"].get<double>();
  double maxKappa = 1.0;

  const double prevKappa = smcObject["kappa"].get<double>();
  double tempKappa = 1.0;

  const double ESS = smcObject["ESS"].get<double>();

  double dKappa = tempKappa - prevKappa;

  const mat w = json2mat( smcObject["weights"] );

  mat ll = getLogLikelihoods( resultObjects );
  const double maxLL = ll.max();

  mat tempWeights = w % exp( dKappa * ll - dKappa * maxLL );
  tempWeights = tempWeights / accu( tempWeights );

  double tempESS = computeESS( tempWeights );
  double alphaESS = alpha * ESS;
  double absDifferenceESS = abs( tempESS - alphaESS );

  if( tempESS < alphaESS ){
    while( absDifferenceESS > 1 ){

      if( tempESS < alphaESS ){
        maxKappa = tempKappa;
      } else {
        minKappa = tempKappa;
      };

      tempKappa = 0.5 * ( maxKappa + minKappa );
      dKappa = tempKappa - prevKappa;

      tempWeights = w % exp( dKappa * ll - dKappa * maxLL );
      tempWeights = tempWeights / accu( tempWeights );

      tempESS = computeESS( tempWeights );
      absDifferenceESS = abs( tempESS - alphaESS );
    };
  };

  smcObject["weights"] = mat2json( tempWeights );
  smcObject["kappa"] = tempKappa;
  smcObject["ESS"] = tempESS;

  return smcObject;
};

int resample( mat& particles, vector<json> resultObjects, const mat& weights) {

  const int nParticles = particles.n_rows;
  const int nParameters = particles.n_cols;

	vector<json> resampled(nParticles);
  mat resampledParticles = zeros( nParticles, nParameters);
	mat cumWeights = cumsum( weights );

	#pragma omp parallel for
	for (int ii = 0; ii < nParticles; ii++) {

		double tempRand = randu();

		for (int jj = 0; jj < nParticles; jj++) {

			if (cumWeights[jj] >= tempRand) {

        resampledParticles.row(ii) = particles.row(jj);
				resampled[ii] = resultObjects[jj];
				break;
			};
		};
	};

  particles = resampledParticles;
	resultObjects = resampled;

  return 0;
};

json constructProposal( const mat& particles, json& smcObject ){

  const int nParticles = particles.n_rows;
  const int nParameters = particles.n_cols;

  const mat w = json2mat( smcObject["weights"] );

  const double targetAR = smcObject["targetAcceptanceRateMCMC"].get<double>();
  const double ar = smcObject["acceptanceRate"].get<double>();
  double mcmcMP = smcObject["mcmcMultiplier"].get<double>();

  double exponent = -5 * ( targetAR - ar );
  mcmcMP = pow( 2, exponent) * mcmcMP;

  mat K;

  try{
    K = weightedCovariance( particles, w);
  } catch( const std::exception& e ) {
    K = eye( nParameters, nParameters);
  };

  mat invD = inv_sympd( sqrt( diagmat(K) ) );
  mat CorrelationMatrix = invD * K * invD;

  mat pMedian = median( particles );
  mat deviations = particles - repmat( pMedian, nParticles, 1);

  mat absoluteDeviations = abs( deviations );
	mat medianAbsoluteDeviations = median( absoluteDeviations );

	K = pow(1.4826, 2) * ( medianAbsoluteDeviations.t() * medianAbsoluteDeviations) % CorrelationMatrix;

  mat cholMH;

  try{
  	mat covMH = mcmcMP * pow( 2.38, 2) / nParameters * K;
  	cholMH = chol(covMH);
  } catch( const std::exception& e ) {
    cholMH = sqrt(mcmcMP) * eye( nParameters, nParameters);
  };

  smcObject["mcmcMultiplier"] = mcmcMP;
  smcObject["mcmcProposalMatrix"] = mat2json( cholMH );
  return smcObject;
};
