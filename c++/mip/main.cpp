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

  mat yData = zeros( n * m, l);

  string field_ii_jj;
  json spectrum_ii_jj_JSON;
  mat spectrum_ii_jj;

  double minY;
  double maxY;
  double z_ii_jj;

  mat mip = zeros( n, m);

  //#pragma omp parallel for
  for( int ii = 0; ii < n; ii++){
    for( int jj = 0; jj < m; jj++){

      field_ii_jj = "y_";
      field_ii_jj += to_string( ii ) + "_";
      field_ii_jj += to_string( jj );

      spectrum_ii_jj_JSON = data["y"][ field_ii_jj ];
      spectrum_ii_jj = json2vec( spectrum_ii_jj_JSON );

      minY = spectrum_ii_jj.min();
      maxY = spectrum_ii_jj.max();
      z_ii_jj = maxY - minY;

      mip( ii, jj) = z_ii_jj;
    };
  };

  string field_kk;
  mat layer_kk;

  json outputJSON;

  for( int kk = 0; kk < l; kk++){

    field_kk = to_string( kk );
    layer_kk = zeros( n, n);

    for( int ii = 0; ii < n; ii++){
      for( int jj = 0; jj < m; jj++){

        field_ii_jj = "y_";
        field_ii_jj += to_string( ii ) + "_";
        field_ii_jj += to_string( jj );

        spectrum_ii_jj_JSON = data["y"][ field_ii_jj ];
        spectrum_ii_jj = json2vec( spectrum_ii_jj_JSON );

        layer_kk( ii, jj) = spectrum_ii_jj( kk );
      };
    };

    outputJSON["layers"][ field_kk ] = mat2json( layer_kk );
  };

  for( int ii = 0; ii < n; ii++){
    for( int jj = 0; jj < m; jj++){

      field_ii_jj = "y_";
      field_ii_jj += to_string( ii ) + "_";
      field_ii_jj += to_string( jj );

      spectrum_ii_jj_JSON = data["y"][ field_ii_jj ];
      outputJSON["spectra"][field_ii_jj] = spectrum_ii_jj_JSON;
    };
  };

  outputJSON["mip"] = mat2json( mip );
  string returnStringJSON = outputJSON.dump();

  ofstream outputFileStream;
  outputFileStream.open( inputFileName + "mip" );

  stringstream outStrStream;
  outStrStream << returnStringJSON << std::endl;
  outputFileStream << outStrStream.rdbuf();

  return 0;
}
