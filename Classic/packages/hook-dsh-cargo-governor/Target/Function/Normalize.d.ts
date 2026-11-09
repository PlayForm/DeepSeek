export default _default;
/**
 * @module Normalize
 *
 * Applies the full-version normalization rule: every simple version value in
 * the dependency sections is expanded to its most specific form.
 *
 * @remarks
 * A Cargo-module directive. No shorthand like "1.0" may remain in a governed
 * Cargo.toml:
 *
 * - "1" → "1.0.0"
 * - "1.2" → "1.2.0"
 * - "1.2.3" → unchanged (already full)
 * - "1.2-rc.1" → "1.2.0-rc.1" (the core is padded BEFORE any prerelease)
 * - "1.2.3-rc.1" → unchanged (prerelease preserved as authored)
 * - "1.2.3+build" → unchanged (build metadata preserved as authored)
 * - "=1.0" → "=1.0.0" (the exact form keeps its = prefix)
 *
 * COMPLEX FORMS ARE LEFT AS-IS (same rule as before): ">=", ">", "<", "~",
 * "^", "*", compound/space ranges — anything that is not a bare (or =
 * prefixed) numeric core with an optional prerelease/build suffix returns null
 * and the value stays byte-identical.
 *
 * Cargo semantics are unchanged by this rule: a bare full version is still
 * Cargo's implicit caret — "1.0.0" means exactly what "1.0" meant, written
 * fully.
 *
 * Pure internal calculation — one of the standing exemptions.
 */
declare function _default(Version: string): string | null;
