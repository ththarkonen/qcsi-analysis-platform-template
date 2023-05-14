#include <stdlib.h>
#include <string>
#include <vector>
#include <armadillo>
#include <omp.h>

#include "../../common/math/mathhelpers.hpp"
#include "../../common/math/smcHelpers.hpp"
#include "../../common/spectrumModels/spectrumModels.hpp"

#include "../../common/json/json.hpp"
#include "../../common/json/jsonutils.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

mat computeBackground( const double detailLevel, const mat& backgroundMatrix){

  int ind = floor( detailLevel );
  const double factor = detailLevel - (double) ind;

  ind = ind + 1;

  const mat constantBackground = backgroundMatrix.row( 0 );

  const mat bg = backgroundMatrix.row( ind );
  const mat bgNextLevel = backgroundMatrix.row( ind + 1 );

  mat background = -constantBackground;
  background = background + bg;
  background = background + factor * ( bgNextLevel - bg );
  background = background.t();

  return background;
};

mat returnAmplitudes( const mat& theta, const int nLineShapes){

  const int startInd = 0;
  const int endInd = nLineShapes - 1;

  mat amplitudes = theta.cols( startInd, endInd);
  return amplitudes;
};

mat returnLocations( const mat& theta, const int nLineShapes){

  const int startInd = nLineShapes;
  const int endInd = 2 * nLineShapes - 1;

  mat locations = theta.cols( startInd, endInd);
  return locations;
};

mat returnGammas( const mat& theta, const int nLineShapes){

  const int startInd = 2 * nLineShapes;
  const int endInd = 3 * nLineShapes - 1;

  mat gammas = theta.cols( startInd, endInd);
  return gammas;
};

mat returnConstantShifts( const mat& theta, const int nLineShapes){

  const int ind = 3 * nLineShapes;

  mat constantShifts = theta.col( ind );
  return constantShifts;
};

mat returnScales( const mat& theta, const int nLineShapes){

  const int ind = 3 * nLineShapes + 1;

  mat scales = theta.col( ind );
  return scales;
};

mat returnBackgroundParameters( const mat& theta, const int nLineShapes){

  const int ind = 3 * nLineShapes + 2;

  mat backgroundParameters = theta.col( ind );
  return backgroundParameters;
};

mat returnNoiseParameters( const mat& theta, const int nLineShapes){

  const int ind = 3 * nLineShapes + 3;

  mat noiseParameters = theta.col( ind );
  return noiseParameters;
};

mat computeTotalQualityFactor( const mat& locations, const mat& gammas){

  mat qTotalLoaded = 0.5 * locations / gammas;
  return qTotalLoaded;
};

mat computeInternalQualityFactor( const mat& qTotalLoaded, const mat& amplitudes){

  mat qInternal = qTotalLoaded / ( 1 - amplitudes );
  return qInternal;
};

mat computeCouplingQualityFactor( const mat& qTotalLoaded, const mat& amplitudes){

  mat qCoupling = qTotalLoaded / amplitudes;
  return qCoupling;
};

json resonatorModel( const mat& x, const mat& y, const mat& theta, const mat& backgroundMatrix, const double s2){

  const int nData = y.n_rows;
  const double nDataDouble = (double) nData;

  const int nParameters = theta.n_cols;
  const int nLineShapes = ( nParameters - 4 ) / 3;

  const mat amplitudes = returnAmplitudes( theta, nLineShapes);
  const mat locations = returnLocations( theta, nLineShapes);
  const mat gammas = returnGammas( theta, nLineShapes);

  const double constantShift = returnConstantShifts( theta, nLineShapes)[0];
  const double scale = returnScales( theta, nLineShapes)[0];
  const mat backgroundParameter = returnBackgroundParameters( theta, nLineShapes);

  const mat background = constantShift + scale * computeBackground( backgroundParameter[0], backgroundMatrix);

  const mat spectrum = 1 - sumLorentz( x, amplitudes, locations, gammas);
  const mat model = spectrum % background;

  const mat e = y - model;

  double ll = dot( e, e) / s2 + nDataDouble * log( 2 * datum::pi ) + nDataDouble * log( s2 );
  ll = -0.5 * ll;

  json j;
  j["logLikelihood"] = ll;
  j["background"] = mat2json( background );
  j["spectrum"] = mat2json( spectrum );
  j["model"] = mat2json( model );

  return j;
};

vector<json> computeModelLikelihood( const mat& particles, const json& smcObject){

  const int nParticles = particles.n_rows;
  const int nParameters = particles.n_cols;
  const int nLineShapes = smcObject["nLineShapes"].get<double>();

  const mat xData = json2vec( smcObject["x"] );
  const mat yData = json2vec( smcObject["y"] );

  const mat backgroundMatrix = json2mat( smcObject["backgroundMatrix"] );
  const string noiseSamplingMode = smcObject["noiseLevelSamplingMode"].get<string>();

  mat s2;

  if( noiseSamplingMode == "sample" ){

    s2 = particles.col( nParameters - 1 );
  } else {

    const double constantS2 = smcObject["noiseSigma2"].get<double>();
    s2 = constantS2 * ones( nParticles, 1);
  };

  const json priors = smcObject["priors"];

  vec ll = -datum::inf * vec( nParticles, fill::ones);
  vector<json> resultObjects(nParticles);

  colvec logPrior = computeLogPrior( particles, priors);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    mat theta_ii = particles.row(ii);
    double s2_ii = s2(ii);

    if( noiseSamplingMode == "sample" ){
      theta_ii.shed_col( nParameters - 1 );
    };

    double logPrior_ii = logPrior[ii];

    json resultObject_ii;
    resultObject_ii["logPriorProbability"] = logPrior_ii;
    resultObject_ii["logLikelihood"] = -datum::inf;

    if( isfinite( logPrior_ii )  ){

      resultObject_ii = resonatorModel( xData, yData, theta_ii, backgroundMatrix, s2_ii);
      resultObject_ii["logPriorProbability"] = logPrior_ii;
    };

    resultObjects[ii] = resultObject_ii;
  };

  return resultObjects;
};
