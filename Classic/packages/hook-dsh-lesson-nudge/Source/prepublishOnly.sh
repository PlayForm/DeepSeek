#!/usr/bin/env bash
# prepublishOnly.sh for @playform/hook-dsh-lesson-nudge - the two-step build,
# mirroring the hook-dsh-live-containers template: the plugin build FIRST
# (its ESBuild config wipes Target/ recursively on start), the test build
# SECOND (it wipes only Target/Test). The negation is mandatory (trap 11):
# 'Source/**/*.ts' also matches the Test tree; without "!Source/Test/**/*.ts"
# the plugin build fails on test-only syntax and ships Test output in Target.
# The third step type-checks the Test tree against the built Target d.ts
# chain. pnpm exec instead of ./node_modules/.bin/tsc because the workspace
# installs with nodeLinker: hoisted.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

# The Test tree is the END-PHASE smoke deliverable; skip its steps until it
# lands (the plugin-dsh-workspace sibling uses the same guard).
if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts

	node Target/Test/Harness.js --selfcheck || exit 1

	pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json
fi
