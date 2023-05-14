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

json computeModelResiduals( const cx_mat& lp, const mat& yEven, const cx_mat& fftL, const int nData){

  mat positiveResult = real( ifft( lp ) );
  positiveResult = clamp( positiveResult, 0.0, datum::inf);

  cx_mat lpPrior = fft( positiveResult );

  cx_mat modelEventFFT = lp % fftL;
  cx_mat modelEvenComplex = ifft( modelEventFFT );

  cx_mat priorEvenFFT = lpPrior % fftL;
  cx_mat priorEvenComplex = ifft( priorEvenFFT );

  mat modelEven = real( modelEvenComplex );
  mat priorEven = real( priorEvenComplex );

  double areaY = accu( modelEven );
  double areaResult = accu( priorEven  );
  double factor = areaY / areaResult;

  priorEven = factor * priorEven;

  mat residuals = yEven - modelEven;
  mat priorResiduals = yEven - priorEven;

  mat modelRealization = modelEven.rows( 0, nData - 1);
  mat priorModelRealization = priorEven.rows( 0, nData - 1);
  residuals = residuals.rows( 0, nData - 1);
  priorResiduals = priorResiduals.rows( 0, nData - 1);

  json j;
  j["modelRealization"] = mat2json( modelRealization );
  j["priorModelRealization"] = mat2json( priorModelRealization );
  j["residuals"] = mat2json( residuals );
  j["priorResiduals"] = mat2json( priorResiduals );

  return j;
};

json lna( const mat& x, const mat& y, const mat& parameters, const double s2, const string& mode){

  const int nData = y.n_rows;
  double nDataDouble = (double) nData;

  const int P = nData;

  mat yEven = zeros( 2 * nData - 1, 1);
  mat yEnd = y.rows(1, nData - 1);

  yEven.rows( nData, 2 * nData - 2) = flipud( yEnd );
  yEven.rows( 0, nData - 1) = y;

  mat L;

  cx_mat fftY;
  cx_mat fftL;

  cx_mat complexFSD;
  mat FSD;
  mat signal;

  double gamma;
  int N;

  if( mode == "lorentz" ){

    gamma = parameters[0];
    N = (int) parameters[1];

    L = evenLorentzLineShape( x, gamma);
  };

  fftY = fft( yEven );
  fftL = fft( L );

  complexFSD = fftY / fftL;
  FSD = real( complexFSD );

  signal = FSD.rows( 0, N - 1);

  mat LP_even = linearPrediction( signal, N, P);
  mat imagPart = mat( LP_even.n_rows, LP_even.n_cols, fill::zeros);

  cx_mat tempLP = cx_mat( LP_even, imagPart);
  cx_mat complexResultEven = ifft( tempLP );
  mat resultEven = real( complexResultEven );

  double areaY = accu( yEven );
  double areaResult = accu( resultEven );
  double factor = areaY / areaResult;

  resultEven = factor * resultEven;
  mat result = resultEven.rows( 0, nData - 1);

  complexResultEven.reset();

  json modelJSON = computeModelResiduals( tempLP, yEven, fftL, nData);

  mat e = json2mat( modelJSON["residuals"] );
  mat ePrior = json2mat( modelJSON["priorResiduals"] );
  mat modelRealization = json2mat( modelJSON["modelRealization"] );
  mat priorModelRealization = json2mat( modelJSON["priorModelRealization"] );

  double ll = dot( e, e) / s2 + nDataDouble * log( 2 * datum::pi ) + nDataDouble * log( s2 );
  ll = -0.5 * ll;

  double logPriorF = dot( ePrior, ePrior) / (s2) + nDataDouble * log( 2 * datum::pi ) + nDataDouble * log( s2 );
  logPriorF = -0.5 * logPriorF;

  json j;
  j["gamma"] = gamma;
  j["N"] = N;
  j["residuals"] = mat2json( e );
  j["priorResiduals"] = mat2json( ePrior );
  j["logLikelihood"] = ll;
  j["logPriorF"] = logPriorF;
  j["modelRealization"] = mat2json( modelRealization );
  j["priorModelRealization"] = mat2json( priorModelRealization );
  j["result"] = mat2json( result );

  return j;
};

vector<json> computeModelLikelihood( const mat& particles, const json& smcObject){

  const mat xData = json2vec( smcObject["x"] );
  const mat yData = json2vec( smcObject["y"] );

  const double s2 = smcObject["noiseSigma2"].get<double>();
  const string mode = smcObject["mode"].get<string>();
  const json priors = smcObject["priors"];

  const int nParticles = particles.n_rows;
  vec ll = -datum::inf * vec( nParticles, fill::ones);
  vector<json> resultObjects(nParticles);

  cout << "Here 2" << "\n";
  cout.flush();

  colvec logPrior = computeLogPrior( particles, priors);

  #pragma omp parallel for
  for(int ii = 0; ii < nParticles; ii++){

    mat theta_ii = particles.row(ii);

    double logPrior_ii = logPrior[ii];

    json resultObject_ii;
    resultObject_ii["logPriorProbability"] = logPrior_ii;
    resultObject_ii["logLikelihood"] = -datum::inf;
    resultObject_ii["logPriorF"] = -datum::inf;

    if( isfinite( logPrior_ii )  ){

      resultObject_ii = lna( xData, yData, theta_ii, s2, mode);
      resultObject_ii["logPriorProbability"] = logPrior_ii;
    };

    resultObjects[ii] = resultObject_ii;
  };

  return resultObjects;
};
