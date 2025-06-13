#!/bin/sh

cd ..

if [ ! -d "json-picker-stencil" ]; then
  echo "Getting json-picker-stencil"
  git clone git@github.com:kit-data-manager/json-picker-stencil.git
fi

cd json-picker-stencil
echo "Building json-picker-stencil"
git pull
npm run build
npm link

echo "Linking json-picker-stencil"
cd ../fair-do-designer
npm link json-picker-stencil

echo "Done!"