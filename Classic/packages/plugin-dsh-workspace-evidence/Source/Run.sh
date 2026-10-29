#!/usr/bin/env bash
# Run.sh for @playform/plugin-dsh-workspace-evidence - the dev twin of
# prepublishOnly.sh, mirroring the live-containers Run.sh pattern:
# the plugin build runs once, then the test build WATCHES Source/Test (when
# the end-phase smoke suite exists). Run a single test with
# `node Target/Test/<Name>/Test.js`; run the whole folder tree through
# `node Maintain/Run/Smokes/Index.mjs` (the aggregate). The plugin-build step
# carries the same negation as prepublishOnly.sh (trap 11: 'Source/**/*.ts'
# matches the Test tree) so the dev twin cannot ship Test output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts \
		--Watch
fi
