#!/usr/bin/env bash
# prepublishOnly.sh for @playform/lib-dsh-workspace-live - the library build,
# mirroring the lib-dsh-core pattern.
# ORDER IS MANDATORY: the library build FIRST, the test build SECOND.
# The library ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it.
# The THIRD step runs the harness selfcheck (the vacuously-green backstop for
# every test folder's fixture). The FOURTH step type-checks the Test tree
# against the built Target d.ts chain.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1

pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json
