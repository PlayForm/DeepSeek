import type Manifest from "../Interface/Manifest.js";
export default _default;
/**
 * @module Decode
 *
 * Parses a Cargo.toml string and identifies the dependency tables.
 *
 * @remarks
 *
 * The pass is parsing-only: the rewrite is Function/Pin's surgical line
 * manipulation on the raw text. Null is returned on any failure or on a
 * non-table root — an unreadable or non-TOML manifest maps to null instead of
 * a throw (the caller logs the "observed non-JSON/TOML Cargo.toml … — skipped"
 * line).
 *
 * Identified shapes (Cargo.toml semantics):
 *
 * - The static tables from Variable/Section: [dependencies],
 *   [dev-dependencies], [build-dependencies], and [workspace.dependencies]
 *   (the SHARED dep table — a Cargo.toml can define versions THERE instead of
 *   in [dependencies]; the module handles both).
 * - Every [target.<target>.dependencies] table and its dev/build variants
 *   (the dynamic target-specific shape, e.g.
 *   [target.'cfg(windows)'.dependencies] and
 *   [target.'cfg(unix)'.dev-dependencies]).
 *
 * Entry values are passed through untouched: a string (the version
 * requirement — bare string = Cargo's implicit caret), a table with a
 * `version` key, an inherited table ({ workspace: true }, parsed from both
 * `dep.workspace = true` and `dep = { workspace = true }`), or a path/git
 * entry (no version key). Classification is the chain pass's job
 * (Function/Satisfy); identification only records what exists.
 *
 * Pure internal calculation — one of the standing exemptions.
 */
declare function _default(Text: unknown): Manifest | null;
