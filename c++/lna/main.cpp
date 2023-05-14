#include <iostream>
#include <fstream>
#include <sstream>
#include <streambuf>
#include <string>
#include <omp.h>

#include "../common/json/json.hpp"
#include "./include/smcSampler.hpp"

using json = nlohmann::json;
using namespace std;

int main( int argc, char *argv[]) {

  string inputFileName( argv[1] );

  ifstream inputFileStream;
  inputFileStream.open( inputFileName );

  stringstream strStream;
  strStream << inputFileStream.rdbuf();

  string inputStringJSON = strStream.str();

  json inputJSON = json::parse( inputStringJSON );
  json resultJSON = smcSampler( inputJSON );

  string returnStringJSON = resultJSON.dump();

  ofstream outputFileStream;
  outputFileStream.open( inputFileName );

  stringstream outStrStream;
  outStrStream << returnStringJSON << std::endl;
  outputFileStream << outStrStream.rdbuf();

  return 0;
}
