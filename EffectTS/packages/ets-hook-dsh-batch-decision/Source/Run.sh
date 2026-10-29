#!/usr/bin/env bash
# Run.sh for @playform/ets-hook-dsh-batch-decision - the dev twin of
# prepublishOnly.sh: the plugin build runs once, then the test build WATCHES
# Source/Test. The plugin-build step carries the same negation (trap 11) so
# the dev twin cannot ship Test output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
