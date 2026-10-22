#!/usr/bin/env bash
# Run.sh for @playform/plugin-dsh-workspace - the dev twin of
# prepublishOnly.sh, mirroring the ets-base-dsh pattern: the plugin build
# runs once, then the test build WATCHES Source/Test (once the Test tree
# exists - the smoke suite is the END-PHASE deliverable). The plugin-build
# step carries the same negation (trap 11) so the dev twin cannot ship Test
# output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts \
		--Watch
fi
