#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-cost - the two-step build, the
# family's minimal shape: ONE Build step (the plugin tree; the negation
# excludes the Test tree per trap 11 - 'Source/**/*.ts' matches it too), then
# the type check. NOTE: `pnpm exec` instead of a package-local .bin because
# the workspace installs with `nodeLinker: hoisted` (the route package's
# precedent).

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

pnpm exec tsc -p Configuration/TypeScript.noemit.json
