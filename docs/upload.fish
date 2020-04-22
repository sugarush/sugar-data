#!/usr/bin/env fish

rm -rf html

jsdoc ../lib ./index.md --recurse --destination ./html --configure ./jsdoc.json

cd html

AWS_PROFILE=sugarush aws s3 cp --recursive . s3://sugar-data-docs-sugarush-io/
