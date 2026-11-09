#!/usr/bin/env bash
# prepublishOnly.sh for @playform/style-dsh-material - the material is SCSS
# only, so its build is a compile: the partials must compile, and Base.scss is
# the sheet that emits the classes. The shared generator owns the compile so
# this check and the plugin builds cannot drift apart.

set -e

node ../../../Maintain/Generate/Stylesheet/Index.mjs --validate
