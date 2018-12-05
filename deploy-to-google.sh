#!/bin/bash
./node_modules/.bin/webpack --mode production --config webpack.config.js
gcloud app deploy app.yaml