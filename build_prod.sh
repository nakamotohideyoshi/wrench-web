#!/usr/bin/env bash



cp config/assets/config.prod.ts   src/store/config.ts \
&& cp config/assets/cognito.prod.js  src/assets/js/cognito.js \
&& yarn run build-prod
