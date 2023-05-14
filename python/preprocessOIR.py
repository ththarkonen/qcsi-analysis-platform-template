import sys
import bioformats as bf
import javabridgeHelpers as jbh
import numpy as np

import hyperspectrumHelpers as hyper

print("here")

filePath = sys.argv[1]
baseKey = sys.argv[2]
partitionSize = int( sys.argv[3] )

jbh.start( bf )

reader = bf.get_image_reader( None, filePath)
print( reader.read( index = 1).shape )

xml =  bf.get_omexml_metadata( filePath )
md = bf.OMEXML( xml )

print( md.image().Pixels.get_SizeX() )
print( md.image().Pixels.get_SizeY() )
print( md.image().Pixels.get_plane_count() )

nRows = md.image().Pixels.get_SizeY()
nCols = md.image().Pixels.get_SizeX()
nLayers = md.image().Pixels.get_plane_count()

print( nRows, nCols, nLayers )

dims = ( nRows, nCols, nLayers)
spectrumCube = np.zeros( dims )

for ii in range( nLayers ):

    print(ii)
    layer_ii = reader.read( index = ii )
    spectrumCube[ :, :, ii] = layer_ii

hyper.maximumIntensityProjection( spectrumCube, baseKey + ".mip")
hyper.layers( spectrumCube, baseKey + "layers/")
hyper.partitionHyperspectrum( spectrumCube, baseKey + "spectra/", partitionSize)
hyper.pca( spectrumCube, baseKey)
hyper.mcr( spectrumCube, baseKey + "mcr/.result")

bf.clear_image_reader_cache()
jbh.stop()

