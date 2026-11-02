#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-skill-learn - the two-step build,
# mirroring the hook-dsh-live-containers template: the plugin build FIRST (its
# ESBuild config wipes Target/ recursively on start), the test build SECOND (it
# wipes only Target/Test). The negation is mandatory (trap 11):
# 'Source/**/*.ts' also matches the Test tree; without "!Source/Test/**/*.ts"
# the plugin build fails on test-only syntax and ships Test output in Target.
# Build alone owns the pipeline: ESBuild writes Target/*.js, then the CLI's own
# tsc pass emits Target/*.d.ts from the package tsconfig.json
# (emitDeclarationOnly) and its tsc-alias pass rewrites the Source aliases
# (@Function, @Interface, @Variable) to relative output paths.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

# The Test tree is the END-PHASE smoke deliverable and lands with its own wave
# (the plan's eight folders, each guarded by its README count); until it exists
# this guard skips both steps rather than failing the release build on a tree
# that is not there yet.
if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts

	node Target/Test/Harness.js --selfcheck || exit 1
fi
