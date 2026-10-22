#!/usr/bin/env bash
# Run.sh for @playform/client-dsh-panel-family-host - the dev twin of
# prepublishOnly.sh, mirroring the live-containers Run.sh pattern: the
# package build runs once, then the test build WATCHES Source/Test. Run a
# single test with `node Target/Test/<Name>/Test.js`; run the whole folder
# tree through `node Maintain/Run-Smokes.mjs` (the aggregate). The
# package-build step carries the same negation as prepublishOnly.sh (trap 11:
# 'Source/**/*.ts' matches the Test tree) so the dev twin cannot ship Test
# output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
