#include <iostream>
#include <fstream>
#include <sstream>
#include <streambuf>
#include <string>
#include <omp.h>
#include <armadillo>

#include "../common/json/json.hpp"
#include "../common/json/jsonutils.hpp"

using json = nlohmann::json;
using namespace std;
using namespace arma;

int main( int argc, char *argv[]) {

  string inputFileName( argv[1] );
  int maxComponents = stoi( argv[2] );

  ifstream inputFileStream;
  inputFileStream.open( inputFileName );

  stringstream strStream;
  strStream << inputFileStream.rdbuf();
  string inputStringJSON = strStream.str();

  json inputJSON = json::parse( inputStringJSON );
  json data = inputJSON["data"];

  int n = data["nRows"].get<int>();
  int m = data["nColumns"].get<int>();
  int l = data["nSlices"].get<int>();

  if( m < maxComponents ){
    maxComponents = m;
  };

  mat yData = zeros( n * m, l);

  string field_ii_jj;
  json spectrum_ii_jj_JSON;
  mat spectrum_ii_jj;
  int counter = 0;

  for( int ii = 0; ii < n; ii++){
    for( int jj = 0; jj < m; jj++){

      field_ii_jj = "y_";
      field_ii_jj += to_string( ii ) + "_";
      field_ii_jj += to_string( jj );

      spectrum_ii_jj_JSON = data["y"][ field_ii_jj ];
      spectrum_ii_jj = json2vec( spectrum_ii_jj_JSON );
      spectrum_ii_jj = spectrum_ii_jj.as_row();

      yData.row( counter ) = spectrum_ii_jj;
      counter++;
    };
  };

  vec col_ii;
  double mean_ii;
  double std_ii;

  for( int ii = 0; ii < l; ii++){

    col_ii = yData.col(ii);

    mean_ii = mean( col_ii );
    std_ii = stddev( col_ii );

    yData.col(ii) = ( col_ii - mean_ii ) / std_ii;
  };

  mat coeff;
  mat score;
  vec latent;

  princomp( coeff, score, latent, yData);

  coeff = coeff.cols( 0, maxComponents - 1);

  double totalEnergy = sum( latent );
  vec cumLatent = cumsum( latent );
  vec explainedVariance = cumLatent / totalEnergy;

  uvec cutoffIndeces = find( explainedVariance >= 0.99, 1);
  int cutoffIndex = cutoffIndeces[0];

  mat truncatedScoresTemp = score.cols( 0, maxComponents - 1);
  mat varianceScoresTemp = score.cols( 0, cutoffIndex);

  mat tempCol;
  double tempMax;
  double tempMin;
  double tempInterval;

  for( int ii = 0; ii < maxComponents; ii++){

    tempCol = abs( truncatedScoresTemp.col(ii) );

    tempMin = tempCol.min();
    tempMax = tempCol.max();
    tempInterval = tempMax - tempMin;

    truncatedScoresTemp.col(ii) = ( tempCol - tempMin ) / tempInterval;
  };

  for( int ii = 0; ii < cutoffIndex + 1; ii++){

    tempCol = abs( varianceScoresTemp.col(ii) );

    tempMin = tempCol.min();
    tempMax = tempCol.max();
    tempInterval = tempMax - tempMin;

    varianceScoresTemp.col(ii) = ( tempCol - tempMin ) / tempInterval;
  };

  cube truncatedScores( n * m, maxComponents, 1);
  cube varianceScores( n * m, cutoffIndex + 1, 1);

  truncatedScores.slice(0) = truncatedScoresTemp;
  varianceScores.slice(0) = varianceScoresTemp;

  truncatedScores.reshape( n, m, maxComponents);
  varianceScores.reshape( n, m, cutoffIndex + 1);

  mat score_ii_jj;
  mat varScore_ii_jj;

  json outputJSON;

  for( int ii = 0; ii < n; ii++){
    for( int jj = 0; jj < m; jj++){

      field_ii_jj = "scores_";
      field_ii_jj += to_string( ii ) + "_";
      field_ii_jj += to_string( jj );

      score_ii_jj = truncatedScores.tube( ii, jj);
      varScore_ii_jj = varianceScores.tube( ii, jj);

      outputJSON["pca"]["scores"][field_ii_jj] = score_ii_jj;
      outputJSON["pca"]["varianceScores"][field_ii_jj] = varScore_ii_jj;
    };
  };

  outputJSON["pca"]["loadings"] = mat2json( coeff.t() );

  string returnStringJSON = outputJSON.dump();

  ofstream outputFileStream;
  outputFileStream.open( inputFileName + "hpca" );

  stringstream outStrStream;
  outStrStream << returnStringJSON << std::endl;
  outputFileStream << outStrStream.rdbuf();

  return 0;
}
