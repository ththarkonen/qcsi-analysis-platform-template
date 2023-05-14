#ifndef MODELHELPERS
#define MODELHELPERS

#include <vector>
#include <armadillo>

#include "../../common/json/json.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

vector<json> computeModelLikelihood( const mat& particles, const json& smcObject);

#endif
