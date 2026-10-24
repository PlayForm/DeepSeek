// Envelope - the inbox block parser (Function/Envelope): the ONE wire format
// the batch packages share through the harness inbox. The producer (the
// pass-on for a proposal, the decision hook for a decision) renders a block
//
//   [BATCH PROPOSAL - <id>]
//   <the canonical proposal JSON>
//
//   [BATCH DECISION - <id>]
//   <the canonical decision JSON>
//
// and the board parses the FIRST such block out of any text the inbox
// carries. The markers are a cross-package contract (each package declares
// its own copy - the self-contained rule), so their bytes are the contract:
// `[BATCH PROPOSAL - ` / `[BATCH DECISION - ` on their own line, the JSON
// body starting on the next line.
//
// A text without a marker is null (the inbox carries ordinary messages too).
// A marker with an unparseable body is returned with `payload: undefined` so
// the caller can record the honest refusal instead of guessing.
export type Kind = "proposal" | "decision";

export interface Envelope {
	kind: Kind;
	id: string;
	payload: Record<string, unknown> | undefined;
}

const MARKER = /^\[BATCH (PROPOSAL|DECISION) - ([^\]\r\n]+)\][ \t]*\r?\n([\s\S]*)$/m;

export default (Text: string): Envelope | null => {
	const Match = MARKER.exec(Text);
	switch (true) {
		case Match === null:
			return null;
		default: {
			const [, Name, Id, Body] = Match as unknown as [string, string, string, string];
			try {
				const Parsed: unknown = JSON.parse(Body);
				switch (true) {
					case Parsed === null || typeof Parsed !== "object":
						return {
							kind: Name === "PROPOSAL" ? "proposal" : "decision",
							id: Id.trim(),
							payload: undefined,
						};
					default:
						return {
							kind: Name === "PROPOSAL" ? "proposal" : "decision",
							id: Id.trim(),
							payload: Parsed as Record<string, unknown>,
						};
				}
			} catch {
				return {
					kind: Name === "PROPOSAL" ? "proposal" : "decision",
					id: Id.trim(),
					payload: undefined,
				};
			}
		}
	}
};
