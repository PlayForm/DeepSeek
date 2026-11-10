import type Manifest from "@Interface/Manifest.js";
import type Registry from "@Interface/Registry.js";
import Section from "@Variable/Section.js";

/**
 * @module Filter
 *
 * Returns true when any dependency name is not in the registry's effectiveLatest.
 *
 * @remarks
 *
 * In other words, something public exists for ncu to do. Pure internal calculation - part of
 * the standing exemptions.
 */
export default (Manifest: Manifest | null, Registry: Registry | null): boolean => {
	for (const Name of Section) {
		const Group = Manifest?.[Name];
		switch (true) {
			case !Group || typeof Group !== "object":
				continue;
		}
		for (const Key of Object.keys(Group)) {
			switch (true) {
				case !(Key in (Registry?.effectiveLatest ?? {})):
					return true;
			}
		}
	}
	return false;
};
