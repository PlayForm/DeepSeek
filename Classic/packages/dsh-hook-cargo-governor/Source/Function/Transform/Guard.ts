// Guard — the refusal guard of the cargo transform: only identified
// dependency tables may differ. Returns the intruding section name (the
// planned entry whose section is not an identified dependency table) or
// null when the plan stays inside the manifest's own tables — the caller
// composes the byte-identical REFUSED line and returns null (the update
// stage is skipped too, exactly the pre-refactor flow). Pure.
import type Plan from "@Interface/Plan.js";
import type Manifest from "@Interface/Manifest.js";

export default (Manifest: Manifest, Planned: Plan): string | null => {
	const Known = new Set(Manifest.sections.map((S) => S.path));
	return Planned.replacements
		.map((R) => R.section)
		.concat(Planned.strips.map((S) => S.section))
		.find((Section) => !Known.has(Section)) as string | null;
};
