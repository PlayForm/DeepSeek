import type Manifest from "@Interface/Manifest.js";
import type Registry from "@Interface/Registry.js";
export default _default;
/**
 * @module Filter
 *
 * Tests true when any dependency name is not in the registry's effectiveLatest.
 *
 * @remarks
 *
 * True means something public for ncu to do. Pure internal calculation - part
 * of the standing exemptions.
 */
declare function _default(Manifest: Manifest | null, Registry: Registry | null): boolean;
