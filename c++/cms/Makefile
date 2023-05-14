CC = g++
CFLAGS = -Wall -g
FILES = main.cpp ../common/*/*.cpp

# ****************************************************
# Targets needed to bring the executable up to date
#
LIBS=-larmadillo -llapack -lblas
FLAGS=-fopenmp -O3
TESTFLAGS=-fopenmp -g3 -Wall

cms: $(FILES)
	g++ -o ../../exe/cms $(FILES) $(LIBS) $(FLAGS)

test: $(FILES)
	g++ -o cms $(FILES) $(LIBS) $(TESTFLAGS)
