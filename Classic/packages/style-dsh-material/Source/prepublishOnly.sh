#!/usr/bin/env bash
# prepublishOnly.sh for @playform/style-dsh-material - the material is SCSS
# only, so its build publishes the partials to Target and compiles the base CSS:
# the three partials are copied to Target/Stylesheet for the plugins' `@use`, and
# Base.scss emits Target/Stylesheet/Base.css. The shared build step owns the
# compile so this build and the client bundles cannot drift apart.

set -e

node ../../../Maintain/Build/Stylesheet/Index.mjs --material
