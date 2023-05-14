
import numeric from 'numeric'

export default {

  levinson( r, n){

    var a_temp = [];

    for (var ii = 0; ii < n; ii++) {
      a_temp[ii] = 0.0;
    };

    var alpha = 0.0;
    var epsilon = 0.0;

    var k = [];
    var a = [];

    k[0] = 0.0;
    a[0] = 1.0;
    a_temp[0] = 1.0;

    alpha = r[0];

    for (var ii = 1; ii <= n; ii++) {

        epsilon = r[ii];                       /* epsilon = a[0]*r[i]; */
        for (var jj = 1; jj < ii; jj++) {

            epsilon += a[jj] * r[ii - jj];
        };

        a[ii] = -epsilon / alpha;
        k[ii] = a[ii];
        alpha = alpha * (1.0 - k[ii] * k[ii]);

        for (var jj = 1; jj < ii; jj++) {

            a_temp[jj] = a[jj] + k[ii] * a[ii - jj];   /* update a[] array into temporary array */
        };

        for (var jj = 1; jj < ii; jj++) {

            a[jj] = a_temp[jj];                 /* update a[] array */
        };
    };

    return a;
  },

  dct( x, weights){

    var len = x.length;
    var halfLen = Math.floor( len / 2 );

    var realPart = Array(len).fill(0);
    var imagPart = Array(len).fill(0);
    var result = Array(len).fill(0);

    for (var ii = 0; ii < halfLen; ii++) {

      realPart[ii] = x[ii * 2];
      realPart[len - 1 - ii] = x[ii * 2 + 1];
    };

    if (len % 2 == 1) {
        realPart[ halfLen ] = x[len - 1];
    };

    var temp = new numeric.T( realPart, imagPart );
    var fftResult = temp.fft();

    for (var ii = 0; ii < len; ii++) {
      result[ii] = ( fftResult.getRow(ii).mul( weights[ii] ) ).x;
    };

    return result;
  },

  computeDctWeights( arr ){

    var n = arr.length;
    var weights = [];

    var tempComplex1;
    var tempComplex2;
    var tempDouble;
    var tempWeight;

    for (var ii = 0; ii < n; ii++) {

        tempDouble = -ii * Math.PI  / ( 2 * n );

        var tempComplex1 = new numeric.T([0], [tempDouble]);

        tempWeight = ( new numeric.t(2, 0).mul( tempComplex1.exp() ) ).div( new numeric.t( Math.sqrt(2 * n), 0) );

        if( ii == 0 ){
          tempWeight = tempWeight.div( numeric.t( Math.sqrt(2), 0) );
        };

        weights[ii] = tempWeight;
    };

    return weights;
  },

  hilbert( x ){

    var len = x.length;
    var halfLen = Math.floor( len / 2 );

    var realPart = Array(len).fill(0);
    var imagPart = Array(len).fill(0);

    for (var ii = 0; ii < len; ii++) {

      realPart[ii] = x[ii];
    };

    var temp = new numeric.T( realPart, imagPart );
    var fftResult = temp.fft();

    var realPart = Array(len).fill(0);
    var imagPart = Array(len).fill(0);

    realPart[0] = fftResult.x[0];
    imagPart[0] = fftResult.y[0];

    for (var ii = 1; ii < halfLen; ii++) {

      realPart[ii] = 2 * fftResult.x[ii];
      imagPart[ii] = 2 * fftResult.y[ii];
    };

    if (len % 2 == 1) {
        realPart[ halfLen ] = 2 * fftResult.x[ halfLen ];
        imagPart[ halfLen ] = 2 * fftResult.y[ halfLen ];
    };

    var temp = new numeric.T( realPart, imagPart );
    var fftResult = temp.ifft();

    var result = [];

    for (var ii = 0; ii < len; ii++) {

      result[ii] = fftResult.y[ii];
    };

    return result;
  },

  findClosestIndex( arr, element) {
    let from = 0, until = arr.length - 1
    while (true) {
        const cursor = Math.floor((from + until) / 2);
        if (cursor === from) {
            const diff1 = element - arr[from];
            const diff2 = arr[until] - element;
            return diff1 <= diff2 ? from : until;
        }

        const found = arr[cursor];
        if (found === element) return cursor;

        if (found > element) {
            until = cursor;
        } else if (found < element) {
            from = cursor;
        }
    }
  },

}
