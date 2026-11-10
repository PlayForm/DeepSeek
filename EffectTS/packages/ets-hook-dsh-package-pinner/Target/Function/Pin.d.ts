import type Manifest from "../Interface/Manifest.js";
export default _default;
/**
 * @module Pin
 *
 * The pure transform (P): strip ONE leading range prefix from every version the
 * config's dependency sections declare, unless the keep-list protects the
 * package.
 *
 * @remarks
 *
 * Deterministic and idempotent: an already-pinned manifest maps to null (no
 * change), so P(P(c)) = P(c) and re-observing a pinned file is a no-op
 * rewrite. Pure internal calculation - part of the standing exemptions.
 *
 * THE RANGE LAW, exactly one decision per value (after the keep-list gate):
 * - NON-STRING value (a map/array entry that is not a version string):
 *   untouched - the pinner only rewrites version strings.
 * - FIRST CHARACTER not one of `^`, `~`, `=`: untouched. This single rule
 *   excludes, by construction, every form the pinner must never touch:
 *   - already-STATIC versions ("0.3.4", "1.2.3-rc.1") - the transform is
 *     idempotent because a static version has no leading prefix;
 *   - wildcards ("*", "" ) - no prefix, no strip;
 *   - PROTOCOL dependencies ("workspace:*", "file:...", "link:...", "git+...",
 *     "npm:alias") - none of them begins with `^`/`~`/`=`;
 *   - comparison ranges (">=1.0.0", ">1 <2") - no prefix in the set.
 * - WHITESPACE anywhere in the value: untouched - a compound/space range
 *   ("^1.0.0 || 2.0.0") is not a single static version and collapsing it would
 *   change meaning, not just notation.
 * - Otherwise: strip the ONE leading prefix character.
 *
 * Documented edge decision (wildcards with a prefix): `"^1.*"` IS stripped -
 * the prefix law applies to the notation before the content, so `"^1.*"` ->
 * `"1.*"`. The static-version rule targets the common caret/tilde/exact case;
 * the pinner strips the prefix and leaves the rest untouched, never inventing
 * content. A deployment that wants wildcards protected adds the package to the
 * pin-policy keep-list.
 */
declare function _default(Current: Manifest, Sections?: string[], Keep?: string[]): {
    Next: Manifest;
    Pinned: number;
} | null;
