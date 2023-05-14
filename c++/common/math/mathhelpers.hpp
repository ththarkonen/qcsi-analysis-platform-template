#ifndef MATHHELPERS
#define MATHHELPERS

#include <armadillo>

using namespace arma;

mat sampleNormalDistribution( const int nParticles, const mat& parameters);
mat sampleHalfNormalDistribution( const int nParticles, const mat& parameters);
mat sampleUniformDistribution( const int nParticles, const mat& parameters);
mat sampleDiscreteUniformDistribution( const int nParticles, const mat& parameters);

double computeNormalDistribution( const double x, const mat& parameters);
double computeHalfNormalDistribution( const double x, const mat& parameters);
double computeUniformDistribution( const double x, const mat& parameters);
double computeDiscreteUniformDistribution( const double x, const mat& parameters);

mat weightedCovariance( const mat &x, const mat &w );

mat linearPrediction( const mat& x, const int N, const int P);

#endif
