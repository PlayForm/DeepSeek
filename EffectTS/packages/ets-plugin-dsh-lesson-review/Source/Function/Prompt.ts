// Prompt - the review prompt composer: the blocks in Variable/Blocks joined in
// the ONE order the judge assumes, plus the optional explicit focus.
//
// THE ORDER IS THE CONTRACT, not a style choice:
//
//   Header    - the task and the "be active" instruction
//   Shape     - what a skill is, before any rule about changing one
//   Signals   - what counts as a reason to act
//   Order     - which operation to prefer (the judge's duplicate rules assume
//               the reviewer was told to prefer a patch over a create)
//   Fence     - what the write must carry (the judge refuses otherwise)
//   Routing   - which of the two stores
//   Never     - what must not be captured
//   Reply     - the exact JSON contract, LAST, so it is the most recent
//               instruction the model reads
//
// A `Focus` (an explicitly requested review - the `/refine` analog) is
// appended AFTER the reply contract as a prioritisation note, never woven into
// the blocks: the blocks stay byte-stable so the smokes can assert them.
import { Fence, Header, Never, Order, Reply, Routing, Shape, Signals } from "@Variable/Blocks.js";

export default (Focus?: string): string => {
	const Body = [Header, Shape, Signals, Order, Fence, Routing, Never, Reply].join("\n\n");
	const Trimmed = (Focus ?? "").trim();
	return Trimmed === ""
		? Body
		: `${Body}\n\nThe user explicitly requested this review with the following focus - prioritize it over the general instructions above:\n${Trimmed}`;
};
