#!/usr/bin/env bash
# prepublishOnly.sh for @playform/plugin-dsh-boot - the ONE-step build.
#
# This package has no Source/Test tree (it is a 90-line scheduling rail; its
# behaviour is verified end-to-end by the launch-timing probe, not by a smoke
# suite), so the family's mandatory second "test build" step and the
# Target/Test/Harness.js selfcheck are deliberately ABSENT: running them here
# would fail on an empty glob rather than on a defect.
#
# THE NEGATION STAYS (trap 11): 'Source/**/*.ts' matches a Test tree if one is
# ever added; the second positional pattern keeps test-only syntax out of the
# plugin build and keeps Target/Test out of the shipped output. The plugin
# ESBuild config's Target plugin wipes outdir "Target" recursively on start.
#
# Build alone owns the pipeline: ESBuild writes Target/*.js, then the CLI's own
# tsc pass emits Target/*.d.ts from the package tsconfig.json
# (emitDeclarationOnly) and its tsc-alias pass rewrites the Source aliases
# (@Function, @Interface, @Variable) to relative output paths.

set -e

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts
