#!/usr/bin/env bash
# Run.sh for @playform/client-dsh-panel-family-host - the dev twin of
# prepublishOnly.sh, mirroring the live-containers Run.sh pattern: the
# package build runs once, then the test build WATCHES Source/Test. Run a
# single test with `node Target/Test/<Name>/Test.js`; run the whole folder
# tree through `node Maintain/Run/Smokes/Index.mjs` (the aggregate). The
# package-build step carries the same negation as prepublishOnly.sh (trap 11:
# 'Source/**/*.ts' matches the Test tree) so the dev twin cannot ship Test
# output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

# The client half (the harness closure-factory bundle); regenerate on every
# dev run so the served ./client export matches the source.
node ../../../Maintain/Build/Client-Bundle/Index.mjs . Source/Client.ts @playform/client-dsh-panel-family-host

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
