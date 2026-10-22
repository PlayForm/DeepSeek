#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-workspace - the two-step build,
# mirroring the ets-base-dsh / hook-dsh-live-containers pattern.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it.
# NOTE: the smoke suite is the END-PHASE deliverable (POC-BRIEF section 2) -
# the Test/Harness.js build steps and the selfcheck are appended there; the
# final tsc pass type-checks the Test tree once it exists.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts

	pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json
fi
