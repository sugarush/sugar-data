#!/usr/bin/env fish

rm -rf html

fish ./build.fish

cd html

AWS_PROFILE=sugarush aws s3 cp --recursive . s3://sugar-data-docs-sugarush-io/
