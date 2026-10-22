// Render - the section framer: one Section in, one framed text block out.
// The frame is FIXED so the consumer cannot mistake the section body for
// harness state (the live-containers frame precedent):
//
//   --- WORKSPACE SECTION <id> (<kind>) - <title> ---
//   <body lines>
//   --- END WORKSPACE SECTION <id> ---
//
// The renderer is PURE and version-stamping: the version rides the header
// when present, so a stale section is visible in the frame itself. Empty
// sections render as the empty string (the caller drops them - the live
// view presents only what exists, the stable-until-event rule).
import type { Section } from "@Interface/Section.js";

export default (Section_: Section): string => {
	const Version = Section_.version === undefined ? "" : ` @ ${Section_.version}`;
	const Head = `--- WORKSPACE SECTION ${Section_.id} (${Section_.kind}) - ${Section_.title}${Version} ---`;
	switch (true) {
		case Section_.lines.length === 0:
			return "";
		default:
			return [Head, ...Section_.lines, `--- END WORKSPACE SECTION ${Section_.id} ---`].join(
				"\n",
			);
	}
};
