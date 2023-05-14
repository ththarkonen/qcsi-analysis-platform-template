#ifndef SPECTRUMMODELS
#define SPECTRUMMODELS

#include <armadillo>

using namespace arma;

mat evenLorentzLineShape( const mat& x, const double gamma);

mat lorentz( const mat& x, const double amplitude, const double x0, const double gamma);
mat fano( const mat& x, const double amplitude, const double x0, const double gamma, const double q);

mat sumLorentz( const mat& x, const mat& amplitudes, const mat& locations, const mat& gammas);
mat sumFano( const mat& x, const mat& amplitudes, const mat& locations, const mat& gammas, const mat& fanoShapes);

#endif
