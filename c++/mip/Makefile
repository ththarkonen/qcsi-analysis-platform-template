CC = g++
CFLAGS = -Wall -g
FILES = main.cpp ../common/*/*.cpp

# ****************************************************
# Targets needed to bring the executable up to date
#
LIBS=-larmadillo -llapack -lblas
FLAGS=-fopenmp -O3
TESTFLAGS=-fopenmp -g3 -Wall

mip: $(FILES)
	g++ -o ../../exe/mip $(FILES) $(LIBS) $(FLAGS)

test: $(FILES)
	g++ -o mip $(FILES) $(LIBS) $(TESTFLAGS)
