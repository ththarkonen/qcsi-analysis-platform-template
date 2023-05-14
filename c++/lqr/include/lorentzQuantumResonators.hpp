#ifndef MODELHELPERS
#define MODELHELPERS

#include <vector>
#include <armadillo>

#include "../../common/json/json.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

mat returnAmplitudes( const mat& theta, const int nLineShapes);
mat returnLocations( const mat& theta, const int nLineShapes);
mat returnGammas( const mat& theta, const int nLineShapes);

mat returnConstantShifts( const mat& theta, const int nLineShapes);
mat returnScales( const mat& theta, const int nLineShapes);
mat returnBackgroundParameters( const mat& theta, const int nLineShapes);
mat returnNoiseParameters( const mat& theta, const int nLineShapes);

mat computeTotalQualityFactor( const mat& locations, const mat& gammas);
mat computeInternalQualityFactor( const mat& qTotalLoaded, const mat& amplitudes);
mat computeCouplingQualityFactor( const mat& qTotalLoaded, const mat& amplitudes);

vector<json> computeModelLikelihood( const mat& particles, const json& smcObject);

#endif
