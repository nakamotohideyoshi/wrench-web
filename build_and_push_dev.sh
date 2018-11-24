#!/usr/bin/env bash


./build_dev.sh \
&& aws s3 sync dist/ s3://wrench-web-dev/ --size-only --delete
