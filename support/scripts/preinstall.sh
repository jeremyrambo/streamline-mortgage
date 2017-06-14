#!/bin/bash

#
# Minify
#
cd support/minifier
npm install
node minify
cd ../../

#
# Version
#
cd support/versioner
npm install
node version
cd ../../
