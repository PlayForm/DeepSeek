#!/usr/bin/env bash
# Run.sh for @playform/client-dsh-workspace-live - the dev twin of
# prepublishOnly.sh, mirroring the hook-dsh-workspace-observe Run.sh pattern:
# the plugin build runs once, then the test build WATCHES Source/Test. Run a
# single test with `node Target/Test/<Name>/Test.js`; run the whole folder tree
# through `node Maintain/Run/Smokes/Index.mjs` (the aggregate). The plugin-build step
# carries the same negation as prepublishOnly.sh (trap 11: 'Source/**/*.ts'
# matches the Test tree) so the dev twin cannot ship Test output either.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

# The client half (the harness closure-factory bundle); regenerate on every
# dev run so the served ./client export matches the source.
node ../../../Maintain/Build/Client-Bundle/Index.mjs . Source/Client.ts @playform/client-dsh-workspace-live

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
