// Filter — true when any dependency name is NOT in the registry's
// effectiveLatest — i.e. something public for ncu to do. Pure internal
// calculation — part of the standing exemptions.
import Section from "@Variable/Section.js";
import type Registry from "@Interface/Registry.js";
import type Manifest from "@Interface/Manifest.js";

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
