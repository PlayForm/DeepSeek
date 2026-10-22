#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-workspace-semantics - the
# two-step build, mirroring the live-containers / lib-dsh-core pattern:
# multiple Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it. Without it the
# plugin build fails on test-only syntax and would ship Test output inside
# Target.
# NOTE: `pnpm exec` instead of `./node_modules/.bin/tsc` because the workspace
# installs with `nodeLinker: hoisted` - the package-local .bin does not exist
# in this trio; pnpm resolves tsc from the root store.
# The smoke suite is the END-PHASE's deliverable (POC-BRIEF section 2); when
# Source/Test exists, the second Build plus the selfcheck run; until then the
# script builds the plugin tree only.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

if [ -d Source/Test ]; then
	Build "Source/Test/**/*.ts" \
		--ESBuild Configuration/Test-ESBuild.ts

	node Target/Test/Harness.js --selfcheck || exit 1

	pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json
fi
