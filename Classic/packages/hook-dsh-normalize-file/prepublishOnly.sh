#!/usr/bin/env bash
# prepublishOnly.sh for @playform/hook-dsh-normalize-file — the two-step build,
# mirroring the Land/Element/Output/Source/prepublishOnly.sh pattern: multiple
# Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it. Without it the
# plugin build fails on test-only syntax and would ship Test output inside
# Target.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1

# Awaited raw-tsc emit + alias rewrite (the L5A finding): the Build CLI runs
# tsc and tsc-alias fire-and-forget, so a slow emit can land after tsc-alias
# and leave @Interface aliases in the tracked Target/*.d.ts. Running both
# awaited, in order, closes the race.
pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p tsconfig.json
