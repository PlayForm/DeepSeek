# Changelog

This file records all notable changes to this package.

## 0.2.1

### Changed

- The release line is renumbered to `0.2.1`, one patch above the `0.2.0` published on npm, so the
  whole family shares a single version again.
- The build-time version constant (`process.env.VERSION_PACKAGE`) compiles in `0.2.1`.

## 0.3.0

### Added

- 2026-10-28 - the CONVERSATION library: the conversation vocabulary (Names), the envelope and the
  state types, the pure fold from the session log's records to the conversation state (Fold), the
  touch derivation (Resolve), the usage read (Usage), and the emission of one envelope per
  state-changing event (Emits) - the conversation spine's section 3.1, smokes over hand-written
  event arrays.
