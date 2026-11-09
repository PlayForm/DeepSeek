#!/usr/bin/env bash
# Run.sh for @playform/lib-dsh-bundle - the dev twin of prepublishOnly.sh: the same one
# build. The package has no test tree, so nothing watches.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts
