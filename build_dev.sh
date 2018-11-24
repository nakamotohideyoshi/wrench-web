#!/usr/bin/env bash



cp config/assets/config.dev.ts   src/store/config.ts \
&& cp config/assets/cognito.dev.js  src/assets/js/cognito.js \
&& yarn run build-dev

