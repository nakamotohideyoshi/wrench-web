#!/usr/bin/env bash



cp config/kevs_stuff/config.prod.ts   src/store/config.ts
cp config/kevs_stuff/cognito.prod.js  src/assets/js/cognito.js
yarn run build-prod


./build_prod.sh \
&& aws s3 cp dist/ s3://wrench-web-prod/ --recursive
