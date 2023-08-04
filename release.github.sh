#!/bin/bash

# Makes archive with assets for release
# src and other git-related things are defaultly included 
# in release so we don't need to include them here

zip_filename="assets.zip"

if [ -f "$zip_filename" ] ; then
    rm "$zip_filename"
fi

files_to_zip=("public/assets")

zip -r "$zip_filename" "${files_to_zip[@]}"

echo "Zip file created: $zip_filename"
