#!/usr/bin/env bash
# prepublishOnly.sh for @playform/ets-hook-dsh-core — the two-step build,
# mirroring the Land/Element/Output/Source/prepublishOnly.sh pattern: multiple
# Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.

set -e

Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1
