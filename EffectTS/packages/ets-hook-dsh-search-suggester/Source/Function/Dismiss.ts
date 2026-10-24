// Dismiss - the `suggestion_dismiss` tool (the plan's section 4.7 dismiss
// path, promoted from the sketch to a registered tool; the P4 item of the
// search suggester's completion spec).
//
// Contract:
//   * input: the suggestion FAMILY (the intent id the note named, e.g.
//     "Version") and an OPTIONAL candidate path. A path dismisses that one
//     candidate; no path dismisses the whole family;
//   * output: the recorded dismissal - `{ dismissed, intent, path?, until,
//     detail }` - where `until` is the epoch-second expiry (`dismissTtl`
//     seconds from the call);
//   * a dismissal is durable: it lives in the knowledge file
//     (`dismissals`), survives a restart, and is honoured by the score gate
//     until it expires (the family suppresses the note, the path is dropped
//     from the candidate list - the plan's section 6.2 rule);
//   * an unknown family is a self-describing error (the ccr tool's
//     precedent), and a disabled suggester refuses (silence-first).
//
// The ledger line is documented in SCHEME section 3:
//   dismissed <Intent> <path|*>.
//
// This file only BUILDS the definition; the registration call lives in
// Function/Apply (the batch-decision/ccr idiom: the definition is readonly
// after registration).
import { defineTool } from "@deepseek-ai/dsh-tools";

import type State from "../Interface/State.js";
import { Dismiss, Save } from "./Persist.js";

export default (
	/** The built per-apply state (the knowledge, the TTL, the pack). */
	State: State,
	/** The ledger append (the factory's Append, bound by Apply). */
	Append: (Message: string) => void,
) =>
	defineTool({
		name: "suggestion_dismiss",
		description:
			"Dismiss a search-suggester suggestion so it is not repeated. Pass the suggestion family (the intent id a note named, e.g. Version, Test, Doc) and optionally one candidate path: with a path only that candidate is dismissed, without one the whole family is dismissed. The dismissal is durable (it survives a restart) and expires after the configured TTL; until then the note is suppressed and the dismissed paths are dropped from the candidate list. Returns the recorded dismissal with its expiry timestamp.",
		parameters: {
			intent: {
				type: "string",
				required: true,
				description:
					"The suggestion family (the intent id the note named: Version, Path, Ledger, Config, Dependency, Test, Symbol, Doc, Usage, Owner).",
			},
			path: {
				type: "string",
				description:
					"Optional candidate path to dismiss (omit to dismiss the whole family).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					dismissed: { type: "boolean", required: true },
					intent: { type: "string", required: true },
					path: { type: "string" },
					until: { type: "integer", required: true },
					detail: { type: "string", required: true },
				},
			},
			render: (_args, value) => [{ type: "text", text: value.detail }],
		},
		async execute(args) {
			if (!State.On) {
				throw new Error(
					"suggestion_dismiss: the search suggester is disabled (enabled=false); there are no suggestions to dismiss",
				);
			}
			const Intent = typeof args.intent === "string" ? args.intent : "";
			const Path =
				typeof args.path === "string" && args.path.length > 0 ? args.path : undefined;
			if (!State.Pack.some((Row) => Row.id === Intent)) {
				throw new Error(
					`suggestion_dismiss: unknown suggestion family "${Intent}"; the pack carries ${State.Pack.map((Row) => Row.id).join(", ")}`,
				);
			}
			const At = Math.floor(Date.now() / 1000);
			const Until = At + State.DismissTtl;
			Dismiss(State.Knowledge, Intent, Path, Until, At);
			Save(State.Knowledge, State.PersistPath);
			Append(`dismissed ${Intent} ${Path ?? "*"}`);
			return {
				dismissed: true,
				intent: Intent,
				...(Path === undefined ? {} : { path: Path }),
				until: Until,
				detail: `dismissed ${Intent}${Path === undefined ? "" : ` ${Path}`} until ${Until}`,
			};
		},
	});
