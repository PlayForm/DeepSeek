import type Manifest from "../Interface/Manifest.js";
import type Registry from "../Interface/Registry.js";
export default _default;
/**
 * @module Filter
 *
 * Reports whether any dependency name in an identified dependency table is
 * outside the registry's effectiveLatest.
 *
 * @remarks
 *
 * True means something public exists for `cargo upgrade` to do. With no
 * registry at all every dep is public, so the update stage always runs (the
 * built-in default policy). Pure internal calculation — part of the standing
 * exemptions.
 */
declare function _default(Manifest: Manifest | null, Registry: Registry | null): boolean;
