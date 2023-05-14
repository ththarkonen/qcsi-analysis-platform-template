CC = g++
CFLAGS = -Wall -g
FILES = main.cpp include/*.cpp ../common/*/*.cpp

# ****************************************************
# Targets needed to bring the executable up to date

LIBS=-larmadillo -llapack -lblas
FLAGS=-fopenmp -O3

lqr: $(FILES)
	g++ -o ../../exe/lqr $(FILES) $(LIBS) $(FLAGS)
