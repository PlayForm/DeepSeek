#!/usr/bin/env bash
# prepublishOnly.sh for @playform/hook-dsh-live-containers - the two-step
# build, mirroring the hook-dsh-core / hook-dsh-normalize-dash pattern:
# multiple Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it. Without it the
# plugin build fails on test-only syntax and would ship Test output inside
# Target.
# The THIRD step type-checks the Test tree against the built Target d.ts
# chain (the tool-coach's pilot correction 2: the Build CLI runs tsc after
# every Build step, so the Test files must be excluded from the plugin
# program - tsconfig.json excludes Source/Test, and the Test tree gets its
# own noemit config here). NOTE: `pnpm exec` instead of
# `./node_modules/.bin/tsc` because the workspace installs with
# `nodeLinker: hoisted` - the package-local .bin does not exist in this
# trio; pnpm resolves tsc from the root store.
# The FOURTH step regenerates the shipped declarations SYNCHRONOUSLY: the
# Build CLI's tsc/tsc-alias spawns are fire-and-forget (Exec does not await
# the children), so the background tsc-alias from the test build can finish
# before the background tsc writes its raw (alias-import) declarations - the
# race leaves `@Interface/...` imports in the tracked Target/*.d.ts. This
# awaited pair runs strictly after every Build child has exited, so the
# shipped declarations are always the tsc-alias-rewritten ones.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1

pnpm exec tsc -p Configuration/TypeScript-Test.noemit.json

pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p tsconfig.json
