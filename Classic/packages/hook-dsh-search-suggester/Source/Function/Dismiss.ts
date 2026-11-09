/**
 * @module Dismiss
 *
 * The `suggestion_dismiss` tool, promoted from the sketch to a registered tool.
 *
 * @remarks
 * The module is the plan's section 4.7 dismiss path and the P4 item of the search suggester's
 * completion spec. Contract:
 *
 *   - input: the suggestion FAMILY (the family id a note named - `History` for the
 *     session-history source, or an id of an EXPLICIT repo/user pack) and an OPTIONAL
 *     candidate path. A path dismisses that one candidate; no path dismisses the whole
 *     family;
 *   - output: the recorded dismissal - `{ dismissed, intent, path?, until, detail }` - where
 *     `until` is the epoch-second expiry (`dismissTtl` seconds from the call);
 *   - a dismissal is durable: it lives in the knowledge file (`dismissals`), survives a
 *     restart, and is honoured by the score gate until it expires (the family suppresses the
 *     note, the path is dropped from the candidate list - the plan's section 6.2 rule);
 *   - an unknown family is a self-describing error (the ccr tool's precedent), and a disabled
 *     suggester refuses (silence-first).
 *
 * THE FAMILY VOCABULARY: the built-in pack is retired, so the known families are the
 * synthetic `History` row plus whatever an explicit pack carries. The State.Pack list is
 * empty at apply (Function/Apply), which is why the history family is named here directly.
 *
 * The ledger line is documented in SCHEME section 3: `dismissed <Intent> <path|*>`.
 *
 * This file only BUILDS the definition; the registration call lives in Function/Apply (the
 * batch-decision/ccr idiom: the definition is readonly after registration).
 */
import { defineTool } from "@deepseek-ai/dsh-tools";

import type State from "../Interface/State.js";
import { Dismiss, Save } from "./Persist.js";

/** The synthetic family the session history builds (Function/Apply). */
const History = "History";

export default (
	/** The built per-apply state (the knowledge, the TTL, the family vocabulary). */
	State: State,

	/** The ledger append (the factory's Append, bound by Apply). */
	Append: (Message: string) => void,
) =>
	defineTool({
		name: "suggestion_dismiss",
		description:
			"Dismiss a search-suggester suggestion so it is not repeated. Pass the suggestion family (the family id a note named: History for the session-history source, or a family of the repo's own pack) and optionally one candidate path: with a path only that candidate is dismissed, without one the whole family is dismissed. The dismissal is durable (it survives a restart) and expires after the configured TTL; until then the note is suppressed and the dismissed paths are dropped from the candidate list. Returns the recorded dismissal with its expiry timestamp.",
		parameters: {
			intent: {
				type: "string",
				required: true,
				description:
					"The suggestion family (the family id the note named: History, or a family of the repo's own pack).",
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
			const Known = [History, ...State.Pack.map((Row) => Row.id)];
			if (!Known.includes(Intent)) {
				throw new Error(
					`suggestion_dismiss: unknown suggestion family "${Intent}"; the known families are ${Known.join(", ")}`,
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
