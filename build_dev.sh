#!/usr/bin/env bash



cp config/kevs_stuff/config.dev.ts   src/store/config.ts \
&& cp config/kevs_stuff/cognito.dev.js  src/assets/js/cognito.js \
&& yarn run build-dev \
&& aws s3 cp dist/ s3://wrench-web-dev/ --recursive
