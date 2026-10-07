#!/usr/bin/env bash
#===============================================================================
# Format.sh - Format the DeepSeek Harness Plugin Family monorepo.
#===============================================================================
#
# Usage:
#   sh Maintain/Format.sh               # Run all formatters
#   sh Maintain/Format.sh prettier      # Format TS/JS/MD/JSON/YAML/CSS/HTML
#   sh Maintain/Format.sh line-endings  # Normalize line endings only (dos2unix)
#
# Configuration:
#   .prettierrc     - Prettier options
#   .prettierignore - Paths excluded from Prettier formatting (Target/, Test/)
#
# Prettier runs over the packages' Source trees, the docs/, and the Site/,
# but NOT the Test/ fixtures or the per-bundle Target/ build output (both
# excluded via .prettierignore). The Boilerplate/Classic/EffectTS
# package-level configs are untouched - this formats only from the
# monorepo root config.
#===============================================================================

set -e

Current=$(cd -- "$(dirname -- "$0")" >/dev/null 2>&1 && pwd)
Root="$Current/.."

#===============================================================================
# Format Functions
#===============================================================================

FormatLineEndings() {
	\echo "========================================"
	\echo "Format Line Endings"
	\echo "========================================"
	\echo "Tooling: dos2unix"
	\echo "========================================"
	\echo ""

	if ! command -v dos2unix >/dev/null 2>&1; then
		\echo "Error: dos2unix is not installed."
		\echo "  macOS:  brew install dos2unix"
		exit 1
	fi

	cd "$Root"

	# Convert CRLF -> LF on every text file, skipping the build output,
	# the dependencies, the fixtures archive, and Git internals.
	#
	# shellcheck disable=SC2038
	find . -type f \
		-not -path "*/node_modules/*" \
		-not -path "*/Target/*" \
		-not -path "*/target/*" \
		-not -path "*/Test/*" \
		-not -path "*/.git/*" \
		-not -path "*/dist/*" \
		-not -path "*/.turbo/*" \
		-not -path "*/.cache/*" |
		xargs dos2unix -q

	\echo ""
	\echo "Line ending conversion complete."
	\echo ""
}

FormatPrettier() {
	\echo "========================================"
	\echo "Format Prettier"
	\echo "========================================"
	\echo "Tooling: Prettier (ts, js, md, json, yml, css, html)"
	\echo "Ignore:  .prettierignore"
	\echo "========================================"
	\echo ""

	cd "$Root"

	\echo "→ Running Prettier..."
	pnpm exec prettier --write --ignore-path .prettierignore .

	\echo ""
	\echo "Prettier formatting complete."
	\echo ""
}

#===============================================================================
# Main Command Router
#===============================================================================

case "${1:-}" in
line-endings)
	FormatLineEndings
	;;
prettier)
	FormatPrettier
	;;
"")
	FormatLineEndings
	FormatPrettier
	\echo "→ Format complete."
	;;
--help | -h)
	\echo "Usage: $0 [line-endings|prettier]"
	\echo ""
	\echo "  line-endings  Normalize line endings (CRLF -> LF) with dos2unix"
	\echo "  prettier      Format TS/JS/MD/JSON/YAML/CSS/HTML with Prettier"
	\echo "  (no arg)      Run all in order"
	;;
*)
	\echo "Unknown target: $1"
	\echo "Use --help for usage information"
	exit 1
	;;
esac
