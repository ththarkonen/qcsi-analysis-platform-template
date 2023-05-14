import math
import numpy as np
from sklearn.decomposition import IncrementalPCA
from sklearn import preprocessing
from sklearn.preprocessing import normalize
from pymcr.mcr import McrAR
from scipy.stats import norm

import s3Helpers as s3h

colorBasis = [[1,0,0],
              [0,0,1],
              [0,1,0],
              [1,0,1],
              [1,1,0],
              [0,1,1],
              [1,1,1],
              [1,0.5,0.5],
              [0.5,1,0.5],
              [0.5,0.5,1.0]]

def partitionHyperspectrum( hyperspectrumCube, baseKey, partitionSize):

    print( baseKey )

    dimensions = hyperspectrumCube.shape

    nRows = dimensions[0]
    nCols = dimensions[1]
    nSlices = dimensions[2]

    print( nRows, nCols, nSlices)

    nRowPartitions = math.ceil( nRows / partitionSize )
    nColPartitions = math.ceil( nCols / partitionSize )

    for ii in range( nRowPartitions ):
        for jj in range( nColPartitions ):

            partition_ii_jj = {}

            minII = ii * partitionSize
            maxII = ( ii + 1 ) * partitionSize - 1
    
            minJJ = jj * partitionSize
            maxJJ = ( jj + 1 ) * partitionSize - 1

            for kk in range( minII, maxII + 1):
                for ll in range( minJJ, maxJJ + 1):

                    key_kk_ll = "y_" + str( kk ) + "_" + str( ll )

                    spectrum_kk_ll = hyperspectrumCube[ kk, ll, :]
                    partition_ii_jj[key_kk_ll] = spectrum_kk_ll.tolist()

            key_ii_jj = baseKey + "y_" + str( maxII ) + "_" + str( maxJJ )
            s3h.uploadObject( key_ii_jj, partition_ii_jj)


def maximumIntensityProjection( hyperspectrumCube, key):

    print( key )
    mip = np.max( hyperspectrumCube, axis = 2)
    mip = mip.tolist()

    s3h.uploadObject( key, mip)


def layers( hyperspectrumCube, baseKey):

    print( baseKey )

    dimensions = hyperspectrumCube.shape
    nSlices = dimensions[2]

    for ii in range( nSlices ):

        layer_ii = hyperspectrumCube[ :, :, ii]
        layer_ii = layer_ii.tolist()

        key_ii = baseKey + "." + str(ii)
        s3h.uploadObject( key_ii, layer_ii)


def pca( hyperspectrumCube, baseKey):

    print( hyperspectrumCube.shape )

    chunkSize = 2 * 16384
    nComponents = 10
    basis = np.array( colorBasis )

    dimensions = hyperspectrumCube.shape

    nRows = dimensions[0]
    nCols = dimensions[1]
    nSlices = dimensions[2]
    nSpectra = nRows * nCols

    if( nSpectra < nComponents ):
        nComponents = nSpectra

    nChunks = math.ceil( nSpectra / chunkSize )
    print( nChunks )

    spectra = hyperspectrumCube.transpose(2,0,1).reshape( nSlices,-1).transpose()
    spectra = preprocessing.scale( spectra, axis = 0)

    print( spectra.shape )
    print( np.mean( spectra, axis = 0) )
    print( np.std(spectra, axis = 0) )

    pca = IncrementalPCA( n_components = nComponents)

    counter = 0
    for ii in range( nChunks + 1 ):

        minIndex = counter * chunkSize
        maxIndex = ( counter + 1 ) * chunkSize
        maxIndex = min( maxIndex, nSpectra + 1)

        chunk_ii = spectra[ minIndex:maxIndex, :]
        pca.partial_fit( chunk_ii )

        print(  ii )

    scores = pca.transform( spectra )
    scores = np.absolute( scores )

    minScores = np.min( scores, axis = 0)
    maxScores = np.max( scores, axis = 0)
    intervals = maxScores - minScores

    for ii in range( nComponents ):

        min_ii = minScores[ii]
        max_ii = maxScores[ii]
        interval_ii = intervals[ii]

        scores[:,ii] = ( scores[:,ii] - min_ii ) / interval_ii


    loadings =  pca.components_

    del spectra    

    print( scores.shape )
    print( loadings.shape )
    loadings = loadings.tolist()

    for ii in range( nComponents ):
        
        maxIndex = ii + 1

        scores_ii = scores[ :, 0:maxIndex]
        basis_ii = basis[ 0:maxIndex, :]

        color_ii = np.matmul( scores_ii, basis_ii)
        norm_ii = normalize( color_ii, axis=1, norm='l1')
        maxNorm_ii = np.amax( norm_ii )

        print( maxNorm_ii )

        color_ii = color_ii.reshape( nRows, nCols, 3)

        color_ii = 255 *  color_ii / maxNorm_ii
        color_ii = color_ii.tolist()

        s3h.uploadObject( baseKey + "pcaColor/." + str(ii), color_ii)

    scores = scores.reshape( nRows, nCols, nComponents)
    scores = scores.tolist()

    s3h.uploadObject( baseKey + "pca/.loadings", loadings)
    s3h.uploadObject( baseKey + "pca/.scores", scores)

    #scores = pca.transform( spectra )
    #print( scores.shape )

def mcr( hyperspectrumCube, key):

    print( hyperspectrumCube.shape )

    mcrar = McrAR()

    dimensions = hyperspectrumCube.shape

    nRows = dimensions[0]
    nCols = dimensions[1]
    nSlices = dimensions[2]
    nSpectra = nRows * nCols

    spectra = hyperspectrumCube.transpose(2,0,1).reshape( nSlices,-1).transpose()
    
    x = range(nSlices)

    nComponents = 5
    means = np.linspace( 0, nSlices - 1, nComponents + 2)

    initial_spectra = np.ndarray([nComponents, nSlices])

    for ii in range(5):

        mean_ii = means[ii + 1]
        initial_spectra[ ii, :] = 0.01 * norm.pdf( x, loc = mean_ii, scale = 1)

    result = mcrar.fit( spectra, ST = initial_spectra)

    #print( yData )
    print( nRows, nCols, nSlices)
    print( mcrar.C_opt_ )
    s3h.uploadObject( key, mcrar.C_opt_)
