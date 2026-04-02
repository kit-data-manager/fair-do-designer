#!/usr/bin/env bash

# This file is meant to be called by pre* scripts.
# The purpose is to copy certain JS modules into the public directory,
# so that they can be fetched by the app at runtime.
# This is necessary because it needs to be used by generated code and in boilerplate code.

# Copy jsonpointerx ESM module
cp node_modules/jsonpointerx/index.esm.js public/js/jsonpointer.js

# Copy jsonpath-plus ESM module
cp node_modules/jsonpath-plus/dist/index-browser-esm.js public/js/jsonpath.js