import sys
import math
import json
import s3Helpers as s3h

import re
from range_regex import bounded_regex_for_range

filePath = sys.argv[1]
baseKey = sys.argv[2]
partitionSize = int( sys.argv[3] )

print( filePath, baseKey)

f = open( filePath )
jsonString = f.read()

project = json.loads( jsonString )

y = project["data"]["y"]

nRows = project["data"]["nRows"]
nCols = project["data"]["nColumns"]
nSlices = project["data"]["nSlices"]

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

        rangeII = bounded_regex_for_range( minII, maxII)
        rangeJJ = bounded_regex_for_range( minJJ, maxJJ)

        range_II_JJ = "y_" + rangeII + "_" + rangeJJ + "$"
        range_II_JJ = range_II_JJ.replace( '\\b', "")

        for key in y.keys():
            if re.match( range_II_JJ, key):
                partition_ii_jj[key] = y[key]

        key_ii_jj = baseKey + "y_" + str( maxII ) + "_" + str( maxJJ )
        s3h.uploadObject( key_ii_jj, partition_ii_jj)
