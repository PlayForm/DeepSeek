#!/usr/bin/env bash
# prepublishOnly.sh for @playform/lib-dsh-style - one step: the package transpiles its
# Source tree to Target. The Target plugin wipes Target/ on start, and the
# package ships no test tree, so there is nothing else to build or preserve.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts
