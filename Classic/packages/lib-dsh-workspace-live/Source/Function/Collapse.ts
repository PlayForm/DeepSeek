// Collapse - the budget collapse: fit the framed sections into a byte
// budget by rendering in order and replacing the OLDEST overflow sections
// with ONE-LINE SUMMARIES (never a silent drop - the live-containers
// failsafe-8 rule: the collapsed section stays visible as its summary line).
// Pure: sections in, { text, collapsed } list out; the caller joins the
// texts with the separator it owns.
import type { Section } from "@Interface/Section.js";

import Render from "./Render.js";

/** One collapsed entry: the rendered text (full frame or one-line summary)
 * and whether it was collapsed by the budget. */
export interface CollapseEntry {
	text: string;
	collapsed: boolean;
}

export default (Sections: Section[], BudgetBytes: number): CollapseEntry[] => {
	const Entries: CollapseEntry[] = [];
	let Used = 0;
	for (const Section_ of Sections) {
		const Text = Render(Section_);
		if (Used + Text.length <= BudgetBytes) {
			Used += Text.length;
			Entries.push({ text: Text, collapsed: false });
			continue;
		}
		// The overflow summary: one line, version-stamped, never dropped.
		const Version = Section_.version === undefined ? "" : ` @ ${Section_.version}`;
		const Summary = `${Section_.id} (${Section_.kind}) collapsed: ${Section_.title}${Version}`;
		Used += Summary.length;
		Entries.push({ text: Summary, collapsed: true });
	}
	return Entries;
};
