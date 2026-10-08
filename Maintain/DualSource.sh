#!/usr/bin/env bash
# ============================================================
# DualSource.sh - Assemble the dual-source package layout.
#
# The dual-source mechanism (DUAL-SOURCE-BUNDLING, batch #7):
# ONE npm package name carries BOTH builds - the Classic build
# and the Effect-TS build - and the user installs once and
# toggles at the loader level (the "classic"/"effect-ts"
# conditions in the exports map, or the ./classic and
# ./effect-ts subpaths). The npm tarball ships both targets,
# so NO postinstall build and NO user-side compilation ever
# runs - the toggle is pure resolution.
#
# Each tree keeps its OWN build in Target/ (the smoke
# contract: every suite imports ../packages/<name>/Target/
# directly). This script fills the SIBLING variant dir into
# each tree so the exports map of BOTH trees resolves in
# place, byte-exact:
#
#   Classic/packages/<name>/Target-EffectTS/  <- the EffectTS
#       tree's build (the published tarball = Target +
#       Target-EffectTS - the CANONICAL publish layout, from
#       the Classic tree).
#   EffectTS/packages/<name>/Target-Classic/  <- the Classic
#       tree's build (the mirror tree's tarball layout).
#
# Run AFTER both trees are built (pnpm build:classic &&
# pnpm build:effect-ts). The publish lane (the npm agent)
# runs this before packing, so the tarball always carries
# both variants.
#
# Usage: bash Maintain/DualSource.sh
# ============================================================
set -euo pipefail

Root=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)/..

Names="hook-dsh-core
hook-dsh-governor-cargo
hook-dsh-governor-package
hook-dsh-normalize-dash
hook-dsh-normalize-ellipsis
hook-dsh-normalize-file
hook-dsh-normalize-fullwidth
hook-dsh-normalize-invisible
hook-dsh-normalize-quotes
hook-dsh-normalize-spaces
hook-dsh-pinner-package
plugin-dsh-factory"

for Name in $Names; do
	# The Effect-TS build into the Classic tree (the canonical publish home).
	EffectTarget="$Root/EffectTS/packages/$Name/Target"
	ClassicSibling="$Root/Classic/packages/$Name/Target-EffectTS"
	if [ ! -f "$EffectTarget/Library.js" ]; then
		echo "FAIL: the EffectTS build is missing: $EffectTarget/Library.js (run pnpm build:effect-ts first)" >&2
		exit 1
	fi
	rm -rf "$ClassicSibling"
	cp -R "$EffectTarget" "$ClassicSibling"

	# The Classic build into the EffectTS tree (the mirror layout).
	ClassicTarget="$Root/Classic/packages/$Name/Target"
	EffectSibling="$Root/EffectTS/packages/$Name/Target-Classic"
	if [ ! -f "$ClassicTarget/Library.js" ]; then
		echo "FAIL: the Classic build is missing: $ClassicTarget/Library.js (run pnpm build:classic first)" >&2
		exit 1
	fi
	rm -rf "$EffectSibling"
	cp -R "$ClassicTarget" "$EffectSibling"
done

echo "dual-source layout assembled: 12 names x 2 trees (Target + the sibling variant, byte-exact)."