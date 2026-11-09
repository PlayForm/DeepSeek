/**
 * @module Filter
 *
 * Reports whether any dependency name in an identified dependency table is
 * outside the registry's effectiveLatest.
 *
 * @remarks
 * True means something public exists for `cargo upgrade` to do. With no
 * registry at all every dep is public, so the update stage always runs (the
 * built-in default policy). Pure internal calculation — part of the standing
 * exemptions.
 */
import type Manifest from "@Interface/Manifest.js";
import type Registry from "@Interface/Registry.js";

export default (Manifest: Manifest | null, Registry: Registry | null): boolean => {
	for (const Section of Manifest?.sections ?? []) {
		for (const Name of Object.keys(Section.deps)) {
			switch (true) {
				case !(Name in (Registry?.effectiveLatest ?? {})):
					return true;
			}
		}
	}
	return false;
};
