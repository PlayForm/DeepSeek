#!/usr/bin/env bash
# prepublishOnly.sh for @playform/lib-dsh-conversation - the plugin build
# (Test tree excluded), the Test build, then the harness selfcheck.
set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1
