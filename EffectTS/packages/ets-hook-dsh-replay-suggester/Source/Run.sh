#!/usr/bin/env bash
# Run.sh for @playform/hook-dsh-replay-suggester - the dev twin of
# prepublishOnly.sh, mirroring the live-containers pattern: the plugin build
# runs once, then the test build WATCHES Source/Test. Run a single test with
# `node Target/Test/<Name>/Test.js`; run the whole folder tree through
# `node Maintain/Run/Smokes/Index.mjs` (the aggregate). The negation is mandatory
# (trap 11) so the dev twin cannot ship Test output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
