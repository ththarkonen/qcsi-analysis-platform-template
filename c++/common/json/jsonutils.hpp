#ifndef JSONUTILS
#define JSONUTILS

#include <armadillo>
#include "json.hpp"
using json = nlohmann::json;

using namespace arma;

cube json2cube(const nlohmann::json& obj);
mat json2mat(const nlohmann::json& obj);
vec json2vec(const nlohmann::json& obj);
json mat2json(const mat& m);
json cube2json(const cube& m);

#endif
