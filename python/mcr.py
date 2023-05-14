
from decouple import config
import json
import sys
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import norm
from pymcr.mcr import McrAR
mcrar = McrAR

mcrar = McrAR()

nComponents = 5
filePath = '../uploads/3284b3d44158f50b874e56548e814ee2'

with open( filePath ) as f:
   data = json.load(f)

n = data["data"]["nRows"]
m = data["data"]["nColumns"]
l = data["data"]["nSlices"]

yData = np.ndarray([n*m, l])

x = range(33)
means = np.linspace( 0, 32, nComponents + 2)

initial_spectra = np.ndarray([nComponents, l])

for ii in range(5):

    mean_ii = means[ii + 1]
    initial_spectra[ ii, :] = 0.01 * norm.pdf( x, loc = mean_ii, scale = 1)

counter = 0

for ii in range( n ):
    for jj in range( m ):

        field_ii_jj = "y_" + str(ii) + "_" + str(jj)
        spectrum_ii_jj = data["data"]["y"][field_ii_jj]

        yData[ counter, :] = spectrum_ii_jj
        counter = counter + 1

result = mcrar.fit( yData, ST = initial_spectra)

print( yData )
print( n, m, l)
print( mcrar.C_opt_ )

im = mcrar.C_opt_[:,1].reshape( [n,m] )

plt.imshow(im)

plt.plot( mcrar.ST_opt_.T)
plt.show()
