#!/usr/bin/env bash



./build_dev.sh \
&& aws s3 cp dist/ s3://wrench-web-dev/ --recursive
