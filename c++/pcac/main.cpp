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
  string colorBasisString( argv[2] );
  string pcaFileName( argv[3] );
  int nComponents = stoi( argv[4] );

  ifstream inputFileStream;
  inputFileStream.open( inputFileName );

  stringstream strStream;
  strStream << inputFileStream.rdbuf();
  string inputStringJSON = strStream.str();

  ifstream inputFileStreamPCA;
  inputFileStreamPCA.open( pcaFileName );

  stringstream strStreamPCA;
  strStreamPCA << inputFileStreamPCA.rdbuf();
  string pcaStringJSON = strStreamPCA.str();

  json inputJSON = json::parse( inputStringJSON );
  json data = inputJSON["data"];

  json pcaJSON = json::parse( pcaStringJSON );

  int n = data["nRows"].get<int>();
  int m = data["nColumns"].get<int>();
  int l = data["nSlices"].get<int>();

  double minY;
  double maxY;
  double z_ii_jj;

  json colorBasisJSON = json::parse( colorBasisString );
  mat colorBasisFull = json2mat( colorBasisJSON );

  json outputJSON;

  for( int nPCA = 0; nPCA < nComponents; nPCA++){

    mat colorBasis = colorBasisFull.rows( 0, nPCA);
    colorBasis = colorBasis.t();

    cube falseColor = zeros( m, n, 3);

    double maxNorm = 0;
    double norm_ii_jj;
    //
    for( int ii = 0; ii < n; ii++){
      //#pragma omp parallel for
      for( int jj = 0; jj < m; jj++){

        string field_ii_jj = "scores_";
        field_ii_jj += to_string( ii ) + "_";
        field_ii_jj += to_string( jj );

        json scores_ii_jj_JSON = pcaJSON["pca"]["scores"][ field_ii_jj ];
        vec scores_ii_jj = json2vec( scores_ii_jj_JSON );
        scores_ii_jj = scores_ii_jj.rows( 0, nPCA);

        vec color_ii_jj = colorBasis * scores_ii_jj;
        norm_ii_jj = norm( color_ii_jj );

        if( norm_ii_jj > maxNorm ){
          maxNorm = norm_ii_jj;
        };

        falseColor.tube( jj, ii) = color_ii_jj;
      };
    };

    falseColor = 255 * falseColor / maxNorm;

    string fieldString_n = to_string( nPCA );
    outputJSON["pcaColor"][fieldString_n] = cube2json( falseColor );
  };

  string returnStringJSON = outputJSON.dump();

  ofstream outputFileStream;
  outputFileStream.open( inputFileName + "pcac" );

  stringstream outStrStream;
  outStrStream << returnStringJSON << std::endl;
  outputFileStream << outStrStream.rdbuf();

  return 0;
}
