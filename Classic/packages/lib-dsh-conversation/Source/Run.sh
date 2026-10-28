#!/usr/bin/env bash
# Run.sh for @playform/lib-dsh-conversation - the dev twin of prepublishOnly.sh,
# mirroring the lib-dsh-trace pattern: the library build runs once, then the
# test build WATCHES Source/Test. Run a single test with
# `node Target/Test/<Name>/Test.js`. The library-build step carries the same
# negation as prepublishOnly.sh (trap 11: 'Source/**/*.ts' matches the Test
# tree) so the dev twin cannot ship Test output either. No type-check step:
# the current convention has none.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
