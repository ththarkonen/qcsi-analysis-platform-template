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
  string indicesString( argv[2] );

  ifstream inputFileStream;
  inputFileStream.open( inputFileName );

  stringstream strStream;
  strStream << inputFileStream.rdbuf();
  string inputStringJSON = strStream.str();

  json inputJSON = json::parse( inputStringJSON );

  json data = inputJSON["data"];
  json indices = json::parse( indicesString );

  int n = data["nRows"].get<int>();
  int m = data["nColumns"].get<int>();
  int l = data["nSlices"].get<int>();

  vec indsII = json2vec( indices["ii"] );
  vec indsJJ = json2vec( indices["jj"] );

  int minII = indsII.min();
  int maxII = indsII.max();

  int minJJ = indsJJ.min();
  int maxJJ = indsJJ.max();

  double nSpectra = (double) (  maxII - minII + 1 ) * ( maxJJ - minJJ + 1 );

  mat yData = zeros( n * m, l);

  string field_ii_jj;
  json spectrum_ii_jj_JSON;
  mat spectrum_ii_jj;

  double minY;
  double maxY;
  double z_ii_jj;

  mat mip = zeros( n, m);
  rowvec meanSpectrum( l );

  //#pragma omp parallel for
  for( int ii = minII; ii <= maxII; ii++){
    for( int jj = minJJ; jj < maxJJ; jj++){

      field_ii_jj = "y_";
      field_ii_jj += to_string( ii ) + "_";
      field_ii_jj += to_string( jj );

      spectrum_ii_jj_JSON = data["y"][ field_ii_jj ];
      spectrum_ii_jj = json2vec( spectrum_ii_jj_JSON );

      meanSpectrum = meanSpectrum + spectrum_ii_jj.as_row() / nSpectra;
    };
  };

  json meanSpectrumJSON = mat2json( meanSpectrum );

  inputJSON["meanSpectrum"] = meanSpectrumJSON;
  string returnStringJSON = inputJSON.dump();

  ofstream outputFileStream;
  outputFileStream.open( inputFileName );

  ofstream spectrumFileStream;
  spectrumFileStream.open( inputFileName + "_result" );

  stringstream outStrStream;
  outStrStream << returnStringJSON << std::endl;
  outputFileStream << outStrStream.rdbuf();

  stringstream spectrumStrStream;
  spectrumStrStream << meanSpectrumJSON.dump() << std::endl;
  spectrumFileStream << spectrumStrStream.rdbuf();

  return 0;
}
