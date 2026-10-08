#!/usr/bin/env bash
#===============================================================================
# Format.sh - Format the DeepSeek Harness Plugin Family monorepo.
#===============================================================================
#
# Usage:
#   sh Maintain/Format.sh               # Run all formatters
#   sh Maintain/Format.sh prettier      # Format TS/JS/JSON/YAML/CSS/HTML + the shell scripts
#   sh Maintain/Format.sh line-endings  # Normalize line endings only (dos2unix)
#   sh Maintain/Format.sh newlines      # Ensure every tracked text file ends with a single LF
#
# Configuration:
#   .prettierrc     - Prettier options (prettier-plugin-sh formats the .sh scripts)
#   .prettierignore - Paths excluded from Prettier formatting
#                     (the markdown, the Site/, Target/, Test/)
#
# Prettier runs over the packages' Source trees and the docs/, but NOT the
# markdown (the family prose is byte-integrity-protected), the Site tree
# (its own repository, its own prettier config), the Test/ fixtures, or the
# per-bundle Target/ build output (all excluded via .prettierignore). The
# shell scripts (Maintain/*.sh) are formatted by the prettier-plugin-sh
# plugin with the same tab convention. The newlines step runs the
# Check-Newlines.mjs gate (the EOF-newline audit) and fixes the missing
# final newlines. The Boilerplate/Classic/EffectTS package-level configs
# are untouched - this formats only from the monorepo root config.
#===============================================================================

set -e

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
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

	if ! command -v dos2unix > /dev/null 2>&1; then
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
		-not -path "*/.cache/*" \
		| xargs dos2unix -q

	\echo ""
	\echo "Line ending conversion complete."
	\echo ""
}

FormatPrettier() {
	\echo "========================================"
	\echo "Format Prettier"
	\echo "========================================"
	\echo "Tooling: Prettier (ts, js, json, yml, css, html)"
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

FormatNewlines() {
	\echo "========================================"
	\echo "Format Newlines"
	\echo "========================================"
	\echo "Tooling: Maintain/Check-Newlines.mjs (node)"
	\echo "========================================"
	\echo ""

	cd "$Root"

	\echo "→ Ensuring every tracked text file ends with a single newline..."
	node Maintain/Check-Newlines.mjs --fix

	\echo ""
	\echo "Newline check complete."
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
	newlines)
		FormatNewlines
		;;
	"")
		FormatLineEndings
		FormatPrettier
		FormatNewlines
		\echo "→ Format complete."
		;;
	--help | -h)
		\echo "Usage: $0 [line-endings|prettier|newlines]"
		\echo ""
		\echo "  line-endings  Normalize line endings (CRLF -> LF) with dos2unix"
		\echo "  prettier      Format TS/JS/JSON/YAML/CSS/HTML + the .sh scripts with Prettier"
		\echo "  newlines      Ensure every tracked text file ends with a single LF"
		\echo "  (no arg)      Run all in order"
		;;
	*)
		\echo "Unknown target: $1"
		\echo "Use --help for usage information"
		exit 1
		;;
esac
