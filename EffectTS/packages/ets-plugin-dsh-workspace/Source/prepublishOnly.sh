#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-workspace - the two-step build,
# mirroring the ets-base-dsh / hook-dsh-live-containers pattern.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it.
# Build alone owns the pipeline: ESBuild writes Target/*.js, then the CLI's
# own tsc pass emits Target/*.d.ts from the package tsconfig.json
# (emitDeclarationOnly) and its tsc-alias pass rewrites the Source aliases
# (@Function, @Interface, @Variable) to relative output paths.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts
fi
