/**
 * @module Filter
 *
 * Returns true when any dependency name is not in the registry's effectiveLatest.
 *
 * @remarks
 * In other words, something public exists for ncu to do. Pure internal calculation - part of
 * the standing exemptions.
 */
import type Manifest from "../Interface/Manifest.js";
import type Registry from "../Interface/Registry.js";
export default _default;
declare function _default(Manifest: Manifest | null, Registry: Registry | null): boolean;
