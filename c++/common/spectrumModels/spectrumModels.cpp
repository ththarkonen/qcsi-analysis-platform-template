
#include <armadillo>

using namespace arma;

mat evenLorentzLineShape( const mat& x, const double gamma){

  const int nData = x.n_rows;

  const double minX = x.min();
  const double maxX = x.max();

  const double xInterval = maxX - minX;
  const vec xNorm = linspace( 0, nData - 1, nData);

  const double gammaNorm = gamma * nData / xInterval;

  mat x0 = xNorm / gammaNorm;
  mat halfshape = ( 1 + x0 % x0 ) * gamma * datum::pi;
  halfshape = 1 / halfshape;
  mat halfshapeEnd = halfshape.rows(1, nData - 1);

  mat lineshape = mat( 2 * nData - 1, 1);

  lineshape.rows( nData, 2 * nData - 2) = flipud( halfshapeEnd );
  lineshape.rows( 0, nData - 1) = halfshape;

  return lineshape;
};

//https://en.wikipedia.org/wiki/Spectral_line_shape#Lorentzian
mat lorentz( const mat& x, const double amplitude, const double x0, const double gamma){

  mat temp = ( x - x0 ) / gamma;
  mat lineshape = amplitude / ( 1 + temp % temp );

  return lineshape;
};

mat fano( const mat& x, const double amplitude, const double x0, const double gamma, const double q){

  mat temp = ( x - x0 ) / gamma;

  mat lineshape = ( temp - q ) % ( temp - q ) / ( temp % temp + 1 );
  lineshape = amplitude - amplitude / ( 1 + q * q ) * lineshape;

  return lineshape;
};

mat sumLorentz( const mat& x, const mat& amplitudes, const mat& locations, const mat& gammas){

  int nData = x.n_rows;
  int nLineShapes = amplitudes.n_cols;

  double a_ii;
  double x0_ii;
  double gamma_ii;

  mat spectrum = zeros( nData, 1);

  for(int ii = 0; ii < nLineShapes; ii++){

    a_ii = amplitudes[ii];
    x0_ii = locations[ii];
    gamma_ii = gammas[ii];

    spectrum = spectrum + lorentz( x, a_ii, x0_ii, gamma_ii);
  };

  return spectrum;
};

mat sumFano( const mat& x, const mat& amplitudes, const mat& locations, const mat& gammas, const mat& fanoShapes){

  int nData = x.n_rows;
  int nLineShapes = amplitudes.n_cols;

  double a_ii;
  double x0_ii;
  double gamma_ii;
  double q_ii;

  mat spectrum = zeros( nData, 1);

  for(int ii = 0; ii < nLineShapes; ii++){

    a_ii = amplitudes[ii];
    x0_ii = locations[ii];
    gamma_ii = gammas[ii];
    q_ii = fanoShapes[ii];

    spectrum = spectrum + fano( x, a_ii, x0_ii, gamma_ii, q_ii);
  };

  return spectrum;
};
