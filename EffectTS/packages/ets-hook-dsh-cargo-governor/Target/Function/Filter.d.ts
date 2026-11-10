/**
 * @module Filter
 *
 * Decide whether any dependency is public to `cargo upgrade`.
 *
 * @remarks
 * True when any dependency name in an identified dependency table is NOT in
 * the registry's effectiveLatest - i.e. something public for
 * `cargo upgrade` to do. With no registry at all every dep is public, so the
 * update stage always runs (the built-in default policy). Pure internal
 * calculation - part of the standing exemptions.
 */
import type Manifest from "../Interface/Manifest.js";
import type Registry from "../Interface/Registry.js";
export default _default;
declare function _default(Manifest: Manifest | null, Registry: Registry | null): boolean;
