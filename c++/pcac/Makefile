CC = g++
CFLAGS = -Wall -g
FILES = main.cpp ../common/*/*.cpp

# ****************************************************
# Targets needed to bring the executable up to date
#
LIBS=-larmadillo -llapack -lblas
FLAGS=-fopenmp -O3
TESTFLAGS=-fopenmp -g3 -Wall

pcac: $(FILES)
	g++ -o ../../exe/pcac $(FILES) $(LIBS) $(FLAGS)

test: $(FILES)
	g++ -o pcac $(FILES) $(LIBS) $(TESTFLAGS)
