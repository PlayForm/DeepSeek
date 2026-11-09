#!/usr/bin/env bash
# prepublishOnly.sh for @playform/style-dsh-material - the material is SCSS
# only, so its build publishes the partials to Target and compiles the base CSS:
# the three partials are copied to Target/Stylesheet for the plugins' `@use`, and
# Base.scss emits Target/Stylesheet/Base.css. The package's own
# Configuration/Material.mjs publishes the partials and compiles the base CSS,
# so a standalone install builds the same surface the monorepo does.

set -e

node Configuration/Material.mjs
