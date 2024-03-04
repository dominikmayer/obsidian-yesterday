#!/bin/bash

# Check if a version number was provided
if [ -z "$1" ]; then
	echo "Usage: $0 <version_number>"
	exit 1
fi

VERSION=$1

# Create a git tag with the provided version number
git tag -a $VERSION -m "$VERSION"

# Push the tag to the remote repository
git push origin $VERSION
