#ifndef SMCHELPERS
#define SMCHELPERS

#include <armadillo>
#include <vector>
#include "../json/json.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

mat samplePrior( const int nParticles, const json& priorJSON );
colvec computeLogPrior( const mat& particles, const json& priorJSON );
json weightTempering( const vector<json>& resultObjects, json smcObject);
int resample( mat& particles, vector<json> resultObjects, const mat& weights);
json constructProposal( const mat& particles, json& smcObject );

mat getLogLikelihoods( const vector<json>& resultObjects );
mat getLogPriorProbabilities( const vector<json>& resultObjects );
mat getLogPriorF( const vector<json>& resultObjects );

mat computeQuantiles( const vector<json>& resultObjects, const string& field, const vec& percentages);

#endif
