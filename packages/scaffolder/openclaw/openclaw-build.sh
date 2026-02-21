#!/bin/bash

set -e
cp ./openclaw/package-bundled.json ./dist/openclaw/package/package.json
cd ./dist/openclaw
zip -r ../ddd-scaffolder.zip package
