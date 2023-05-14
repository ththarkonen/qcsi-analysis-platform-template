#include <vector>
#include <armadillo>

using namespace arma;

mat sampleNormalDistribution( const int nParticles, const mat& parameters){

  const double mu = parameters[0];
  const double sigma = parameters[1];

  mat x = mu + sigma * randn( nParticles, 1);
  return x;
};

mat sampleHalfNormalDistribution( const int nParticles, const mat& parameters){

  const double positivity = parameters[0];

  const double mu = 0.0;
  const double sigma = parameters[1];

  mat x;

  if( positivity > 0 ){
    x = mu + abs( sigma * randn( nParticles, 1) );
  } else {
    x = mu - abs( sigma * randn( nParticles, 1) );
  };

  return x;
};

mat sampleUniformDistribution( const int nParticles, const mat& parameters){

  const double min = parameters[0];
  const double max = parameters[1];

  const double interval = max - min;

  mat x = min + interval * randu( nParticles, 1);
  return x;
};

mat sampleDiscreteUniformDistribution( const int nParticles, const mat& parameters){

  const double min = parameters[0];
  const double max = parameters[1];

  auto param = distr_param( min, max);

  const double interval = max - min;

  imat ix = randi( nParticles, param);
  mat x = conv_to<mat>::from( ix );
  return x;
};

double computeNormalDistribution( const double x, const mat& parameters){

  const double mu = parameters[0];
  const double sigma = parameters[1];

  double p = normpdf( x, mu, sigma);
  return p;
};

double computeHalfNormalDistribution( const double x, const mat& parameters){

  const double positivity = parameters[0];

  const double mu = 0.0;
  const double sigma = parameters[1];

  double p;

  if( positivity > 0 ){

    if( x < 0 ){
      p = 0;
    } else {
      p = normpdf( x, mu, sigma);
    };
  } else {

    if( x > 0 ){
      p = 0;
    } else {
      p = normpdf( x, mu, sigma);
    };
  };
  
  return p;
};

double computeUniformDistribution( const double x, const mat& parameters){

  const double min = parameters[0];
  const double max = parameters[1];
  const double interval = max - min;

  double p;

  bool over = x > max;
  bool under = x < min;
  bool outOfBounds = over || under;

  if( outOfBounds ){
    p = 0;
  } else {
    p = 1 / interval;
  };

  return p;
};

double computeDiscreteUniformDistribution( const double x, const mat& parameters){

  const double min = parameters[0];
  const double max = parameters[1];
  const double interval = max - min;

  double p;

  bool over = x > max;
  bool under = x < min;
  bool outOfBounds = over || under;

  if( outOfBounds ){
    p = 0;
  } else {
    p = 1 / ( interval + 1 );
  };

  return p;
};

vec burg( const mat &x ){

    int N = x.n_rows;
    int M = N - 1;

    mat efp = x.rows( 1, N - 1);
    mat ebp = x.rows( 0, N - 2);
    mat tempVec;
    int sizeErrorVec = efp.n_rows;
    rowvec ef( sizeErrorVec );

    vec coeffs(M);

    mat a(N, 1);
    a.zeros();
    a[0] = 1;

    mat k;

    for( int m = 0; m < M; m++){

        sizeErrorVec = efp.n_rows;

        k = ( -2 * trans(ebp) * efp ) / ( trans(efp) * efp + trans(ebp) * ebp );

        if( sizeErrorVec > 1 ){
            mat ef = efp.rows( 1, sizeErrorVec - 1) + ( k[0] * ebp.rows( 1, sizeErrorVec - 1) );

            tempVec = ebp.rows( 0, sizeErrorVec - 2) + ( k[0] * efp.rows( 0, sizeErrorVec - 2) );
            ebp = tempVec;
            efp = ef;
        }

        a.rows( 1, m + 1 ) += k[0] * flipud( a.rows( 0, m ) );
    }

    coeffs = a.rows( 1, M);
    return coeffs;
};


vec extrapolate( const vec& a, const mat& x, const int P){

    int n = a.size();
    int m = n + 1;

    vec b_temp (n+1);
    b_temp.rows(1,n) = conv_to< vec >::from(a);
    b_temp[0] = 0;
    b_temp = -1*b_temp;

    vec a_temp (n+1);
    a_temp.zeros();
    a_temp[0] = 1.0;

    vec z (n+1);
    z.zeros();

    mat y = mat(m,1);
    y.zeros();

    for( int ii = 0; ii < m; ii++ ){

        y[ii] = b_temp[0] * x[ii] + z[0];

        for( int jj = 1; jj < n + 1; jj++ ){

            z[jj - 1] = b_temp[jj] * x[ii] + z[jj] - a_temp[jj] * y[ii];
        };
    };

    a_temp[0] = 1.0;
    a_temp.rows(1,n) = conv_to< vec >::from(a);
    a_temp = a_temp;
    b_temp.zeros();

    vec extrapolatedSignal(P);
    extrapolatedSignal.rows(0, n) = x;

    for( int ii = m; ii < P; ii++ ){

        extrapolatedSignal[ii] = z[0];

        for( int jj = 1; jj < n+1; jj++ ){

            z[jj - 1] = z[jj] - a_temp[jj] * extrapolatedSignal[ii];
        };
    };

    return extrapolatedSignal;
};

mat linearPrediction( const mat& x, const int N, const int P){

  vec ar = burg( x );

  vec extrapolatedSignal = extrapolate( ar, x, P);
  vec extrapolatedSignalEnd = extrapolatedSignal.rows( 1, P - 1);

  vec extrapolatedSignalEven( 2 * P - 1 );

  extrapolatedSignalEven.rows( 0, P - 1) = extrapolatedSignal;
  extrapolatedSignalEven.rows( P, 2 * P - 2) = flipud( extrapolatedSignalEnd );

  return extrapolatedSignalEven;
};

mat weightedCovariance( const mat &x, const mat &w ){

    int nObs = x.n_rows;
    int nVar = x.n_cols;

    mat K = x - repmat( w.t() * x, nObs, 1 );
    K = K.t() * ( K % repmat( w, 1, nVar ) );
    K = 0.5 * ( K + K.t() ) / ( 1.0 - accu( pow( w, 2 ) ) );

    return K;
};
