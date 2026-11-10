/**
 * @module Satisfy
 *
 * The chain pass (P): canonicalize governed pins, keep public deps.
 *
 * @remarks
 * The canonical target is ALWAYS "^<resolved>" (FLOW.md §2 "propagate": pin =
 * ^resolved in every manifest that declares dep). Only a plain string
 * comparison is needed - no semver comparator to get wrong. Idempotent: an
 * already-canonical manifest maps to null (no change). Pure internal
 * calculation - one of the two standing exemptions.
 */
import type Manifest from "../Interface/Manifest.js";
import type Registry from "../Interface/Registry.js";
export default _default;
declare function _default(Manifest: Manifest, Registry: Registry | null, Strict: boolean): Manifest | null;
