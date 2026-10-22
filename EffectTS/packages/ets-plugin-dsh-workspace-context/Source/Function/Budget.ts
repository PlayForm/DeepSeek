// Budget - the packet's budget clamp (Function/Budget): build the text form,
// measure it in tokens (Function/Tokens: the harness tokenMeter where
// available, else chars/4), and if it exceeds the target, drop the weakest
// NEIGHBORS lines one by one (the V4-1 contract: "the weakest neighbors are
// dropped first") until the packet fits the target or the neighbors run out.
// If the packet still exceeds the hard cap, truncate the OPEN and EVIDENCE
// lines last and record the clamp in the ledger. Returns the (possibly
// trimmed) packet.
import Render from "@Function/Render.js";
import Tokens from "@Function/Tokens.js";
import type Packet from "@Interface/Packet.js";
import type State from "@Interface/State.js";

export default (State: State, Item: Packet): Packet => {
	const Full = Render(Item);
	let Size = Tokens(State, Full);
	switch (true) {
		case Size <= State.BudgetTokens:
			Item.tokens = Size;
			return Item;
		default:
	}
	// The neighbor drop: weakest first (the list is strongest-first).
	while (Item.neighbors.length > 0 && Size > State.BudgetTokens) {
		Item.neighbors.pop();
		Size = Tokens(State, Render(Item));
	}
	// The hard-cap clamp: cut the OPEN lines, then the EVIDENCE lines.
	while (Item.open.length > 0 && Size > State.BudgetMaximum) {
		Item.open.pop();
		Size = Tokens(State, Render(Item));
	}
	while (Item.evidence.length > 0 && Size > State.BudgetMaximum) {
		Item.evidence.pop();
		Size = Tokens(State, Render(Item));
	}
	Item.tokens = Size;
	State.Clamped += 1;
	State.Factory.Append(
		State,
		`clamped (${Tokens(State, Full)} -> ${Size} tok, budget ${State.BudgetMaximum})`,
	);
	return Item;
};
