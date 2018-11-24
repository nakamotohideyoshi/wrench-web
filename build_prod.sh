#!/usr/bin/env bash



cp config/kevs_stuff/config.prod.ts   src/store/config.ts
cp config/kevs_stuff/cognito.prod.js  src/assets/js/cognito.js
yarn run build-prod
