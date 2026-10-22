// Render - the packet's text form (Function/Render): the eight fixed
// sections in the V4-1 section 3.5 order, one section header per line
// followed by that section's lines; the STALE section is omitted entirely
// when the caller is current (the contract: "STALE <the version the caller
// held, if it differs>"). This is the exact text the token measurement and
// the budget clamp run against.
import type Packet from "@Interface/Packet.js";

export default (Item: Packet): string => {
	const Lines: string[] = [
		Item.workspace,
		Item.scope,
		"MAP",
		...Item.map,
		Item.focus,
		"NEIGHBORS",
	];
	for (const Neighbor of Item.neighbors) {
		Lines.push(Neighbor);
	}
	Lines.push("EVIDENCE");
	for (const Proof of Item.evidence) {
		Lines.push(Proof);
	}
	Lines.push("OPEN");
	for (const Gap of Item.open) {
		Lines.push(Gap);
	}
	switch (true) {
		case Item.stale !== undefined:
			Lines.push(`STALE ${Item.stale}`);
			break;
		default:
	}
	return Lines.join("\n");
};
