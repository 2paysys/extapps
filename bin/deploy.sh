#!/bin/bash

script_dir=`dirname $0`
source_dir="$script_dir/../merchantpay/app"
dest_dir="$script_dir/../../gh-pages"
rsync_cmd="rsync --exclude \".*\" -av "

# Copy root
rsync --exclude ".*" -av "$script_dir/../root/" "$dest_dir"

# Copy Projects
rsync --exclude ".*" -av "$source_dir/" "$dest_dir/merchantpay/"
