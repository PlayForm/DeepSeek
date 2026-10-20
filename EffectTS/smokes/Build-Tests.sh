#!/usr/bin/env bash
# Build-Tests.sh - compiles the smokes' wiring test tree (Test/**/*.ts) to
# Test.mjs BESIDE the sources. The wiring folders import the shared
# wiring-live.mjs with a relative specifier that must stay valid from the
# compiled file (the packages' mirrored outbase trick cannot apply here: the
# harness lives outside the Test tree), so the output is compiled in place -
# outdir = outbase = Test, no Target/ mirror and no wipe: esbuild overwrites
# each output. The .mjs extension is deliberate: the smokes tree has no
# package.json with "type": "module", so a compiled .js would be reparsed as
# ES module with a stderr warning on every run - .mjs is ESM-native and
# silent. The Build CLI is NOT used on purpose: its base config wipes
# `outdir` recursively on start, which would delete this source tree.
# After the compile, the test tree type-checks with the smokes tsconfig.
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$HERE"

# Pre-clean: remove stale compiled outputs (a renamed folder leaves orphans;
# the sources are .ts and .md only, so every .js/.mjs under Test is build
# output).
find Test -name '*.js' -delete
find Test -name '*.mjs' -delete
find Test -name '*.js.map' -delete
find Test -name '*.mjs.map' -delete

node "$ROOT/node_modules/esbuild/bin/esbuild" 'Test/**/*.ts' \
	--outdir=Test \
	--outbase=Test \
	--format=esm \
	--platform=node \
	--target=esnext \
	--sourcemap \
	--log-level=warning \
	--out-extension:.js=.mjs \
	--tsconfig=tsconfig.json

node "$ROOT/node_modules/typescript/bin/tsc" -p tsconfig.json
