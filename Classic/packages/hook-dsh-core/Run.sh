#!/usr/bin/env bash
# Run.sh for @playform/hook-dsh-core — the dev twin of prepublishOnly.sh,
# mirroring the Land/Element/Output/Source/Run.sh pattern: the plugin build
# runs once, then the test build WATCHES Source/Test. Run a single test with
# `node Target/Test/<Name>/Test.js`; run the whole folder tree through
# `node Maintain/Run-Smokes.mjs` (the aggregate).

set -e

Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
