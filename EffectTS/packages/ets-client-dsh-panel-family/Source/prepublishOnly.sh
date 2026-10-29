#!/usr/bin/env bash
# prepublishOnly.sh for @playform/ets-client-dsh-panel-family - the two-step
# build, mirroring the hook-dsh-workspace-observe / live-containers pattern:
# multiple Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it. Without it the
# plugin build fails on test-only syntax and would ship Test output inside
# Target.
# Build alone owns the pipeline: ESBuild writes Target/*.js, then the CLI's
# own tsc pass emits Target/*.d.ts from the package tsconfig.json
# (emitDeclarationOnly) and its tsc-alias pass rewrites the Source aliases
# (@Function, @Interface, @Variable) to relative output paths.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

# The client half: the harness client-bundle contract (the closure factory
# `window.__ModuleLoader__.load({ id, factory })` expects - the ESM build
# above is NOT servable by the client module system). Runs after the plugin
# build because that build wipes Target/.
node ../../../Maintain/Build/Client-Bundle/Index.mjs . Source/Client.ts @playform/ets-client-dsh-panel-family

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1
