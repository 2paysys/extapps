#!/bin/bash

script_dir=`dirname $0`
source_dir="$script_dir/.."
dest_dir="$source_dir/../gh-pages"
rsync_cmd="rsync --exclude \".*\" -av "

# Copy root
rsync --exclude ".*" -av "$source_dir/root/" "$dest_dir"

# Copy Projects
for dir in merchantpay;
do
	rsync --exclude ".*" -av "$source_dir/$dir" "$dest_dir/$dir"
done
