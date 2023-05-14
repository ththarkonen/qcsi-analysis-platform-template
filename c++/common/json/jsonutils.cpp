#include <armadillo>
#include <vector>

using namespace arma;
using namespace std;

#include "json.hpp"
using json = nlohmann::json;

cube json2cube(const nlohmann::json& obj) {

  int n = obj.size(), m = obj[0].size(), l = obj[0][0].size();
  arma::cube ans(n,m,l,arma::fill::zeros);

  for (int i=0; i<n; i++) {
    for (int j=0; j<m; j++) {
      for ( int k = 0; k < l; k++){

        ans(i,j,k) = obj[i][j][k];
      }
    }
  }

  return ans;
}

/**
 * @brief Converts a JSON object to an arma::mat object
 * @since version 0.0.1
 */
mat json2mat(const nlohmann::json& obj) {
  int n = obj.size(), m = obj[0].size();
  arma::mat ans(n,m,arma::fill::zeros);
  for (int i=0; i<n; i++) {
    for (int j=0; j<m; j++) {
      ans(i,j) = obj[i][j];
    }
  }
  return ans;
}

/**
 * @brief Converts a JSON object to an arma::vec object
 * @since version 0.0.1
 */
vec json2vec(const nlohmann::json& obj) {
  int n = obj.size();
  arma::vec ans(n);
  for (int i=0; i<n; i++) {
    ans[i] = obj[i];
  }
  return ans;
}

json mat2json(const mat& m) {
    vector<vector<double> > stdvecs;
    for (int i = 0; i < m.n_rows; i++) {
        std::vector<double> stdrow = conv_to<vector<double>>::from(
            m.row(i));
        stdvecs.push_back(stdrow);
    }
    json ret(stdvecs);
    return ret;
}

json cube2json(const cube& m) {

  int nRows = m.n_rows;
  int nCols = m.n_cols;
  int nSlices = m.n_slices;

  vector<double> slice( nSlices, 0);
  vector<vector<double>> matrix( nCols, slice);
  vector<vector<vector<double>>> stdCube( nRows, matrix);

  for (int i = 0; i < m.n_rows; i++) {
    for( int j = 0; j < m.n_cols; j++){
      for( int k = 0; k < m.n_slices; k++){
        stdCube[i][j][k] = m(i,j,k);
      };
    };
  };
  json ret(stdCube);
  return ret;
}
