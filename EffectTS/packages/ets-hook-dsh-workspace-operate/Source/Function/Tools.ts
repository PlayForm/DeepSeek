// Tools - the operate hook's two model surfaces (Function/Tools, the
// live-containers MonitorTools idiom): the tools live inside their owning
// hook (OPERATE.md; the ccr registers ccr_retrieve). The propose tool
// returns the Outcome verbatim - a proposed proposal or the typed refusal,
// rendered as one canonical JSON value; it NEVER writes a file (the
// proposal's application is the later approve/merge steps' work).
//
//   workspace_propose    - create a typed proposal (rename | connect |
//                          replace) through the resolution rules;
//   workspace_proposals  - the read/manage surface: list, get, withdraw,
//                          stats.
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { JsonValue } from "@deepseek-ai/dsh-util-values";
import Propose from "@Function/Propose.js";
import * as Query from "@Function/Query.js";
import Withdraw from "@Function/Withdraw.js";
import type State from "@Interface/State.js";

const Read = (Args: unknown, Key: string): unknown =>
	Args !== null && typeof Args === "object" ? (Args as Record<string, unknown>)[Key] : undefined;

const ReadStr = (Args: unknown, Key: string): string => {
	const Value = Read(Args, Key);
	return typeof Value === "string" ? Value : "";
};

/** Build the workspace_propose tool definition. */
export const ProposeTool = (State: State) =>
	defineTool({
		name: "workspace_propose",
		description:
			"Propose a typed workspace operation through the resolution rules. kind=rename (path, name, to) renames a symbol the graph knows; kind=connect (fromPath, toPath, edge, optional fromSymbol/toSymbol) proposes a graph edge; kind=replace (path, startLine, endLine, content) proposes replacing a span. A proposal is never guessed: every rule failure returns a typed refusal (graph-unavailable, unknown-symbol, name-collision, duplicate-edge, incompatible-edge, missing-version, stale-version, span-beyond-file). Supplying version (the file version you saw) keeps your proposal fresh; without it the hook uses the version it observed itself, if any. The proposal is recorded, not applied.",
		parameters: {
			kind: {
				type: "string",
				required: true,
				description: "rename | connect | replace",
			},
			path: {
				type: "string",
				description: "The file (rename/replace) or the from-side file (connect).",
			},
			name: { type: "string", description: "rename: the symbol's current name." },
			to: { type: "string", description: "rename: the new name." },
			fromPath: { type: "string", description: "connect: the source file." },
			fromSymbol: {
				type: "string",
				description: "connect: the source symbol (omit for the file).",
			},
			toPath: { type: "string", description: "connect: the target file." },
			toSymbol: {
				type: "string",
				description: "connect: the target symbol (omit for the file).",
			},
			edge: {
				type: "string",
				description: "connect: contains | imports | references | calls | tests.",
			},
			startLine: {
				type: "number",
				description: "replace: the span's start line (1-based, inclusive).",
			},
			endLine: {
				type: "number",
				description: "replace: the span's end line (1-based, inclusive).",
			},
			content: { type: "string", description: "replace: the replacement content." },
			version: { type: "string", description: "The version fence you saw (recommended)." },
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					status: { type: "string", required: true },
					proposal: { type: "json" },
					refusal: { type: "json" },
				},
			},
			render: (_args, value) => {
				const V = value as {
					status: string;
					proposal?: { id: string; kind: string; path: string; version: string };
					refusal?: { reason: string; detail: string };
				};
				if (V.status === "proposed" && V.proposal !== undefined) {
					return [
						{
							type: "text",
							text: `proposed ${V.proposal.id} (${V.proposal.kind} ${V.proposal.path}, fence ${V.proposal.version}) - recorded, not applied.`,
						},
					];
				}
				return [
					{
						type: "text",
						text: `refused (${V.refusal?.reason}): ${V.refusal?.detail}`,
					},
				];
			},
		},
		async execute(args, _exec) {
			const Kind = ReadStr(args, "kind");
			const Path = ReadStr(args, "path");
			const FromPath = ReadStr(args, "fromPath");
			const Input =
				Kind === "connect"
					? {
							from: {
								path: FromPath,
								symbol: ReadStr(args, "fromSymbol") || undefined,
							},
							target: {
								path: ReadStr(args, "toPath"),
								symbol: ReadStr(args, "toSymbol") || undefined,
							},
							edge: ReadStr(args, "edge"),
							version: ReadStr(args, "version") || undefined,
						}
					: Kind === "replace"
						? {
								path: Path,
								span: {
									startLine: Number(Read(args, "startLine")),
									endLine: Number(Read(args, "endLine")),
								},
								content: Read(args, "content"),
								version: ReadStr(args, "version") || undefined,
							}
						: {
								path: Path,
								name: ReadStr(args, "name"),
								to: ReadStr(args, "to"),
								version: ReadStr(args, "version") || undefined,
							};
			const Outcome = await Propose(
				State,
				Kind === "connect" || Kind === "replace" ? Kind : "rename",
				Input,
			);
			switch (true) {
				case Outcome.status === "proposed":
					// JSON-projected: the Proposal interface has no string index
					// signature of its own.
					return {
						status: "proposed",
						proposal: Outcome.proposal as unknown as JsonValue,
					};
				default:
					return {
						status: "refused",
						refusal: Outcome.refusal as unknown as JsonValue,
					};
			}
		},
	});

/** Build the workspace_proposals tool definition. */
export const ProposalsTool = (State: State) =>
	defineTool({
		name: "workspace_proposals",
		description:
			"Inspect and manage the recorded workspace proposals. list (optionally kind/path/status/limit) shows the table; get=id shows one proposal; withdraw=id marks one proposed operation withdrawn; stats shows the honest counts (proposals, refused, sequence, byKind).",
		parameters: {
			list: { type: "boolean", description: "List the proposals (default action)." },
			get: { type: "string", description: "Show one proposal by id." },
			withdraw: { type: "string", description: "Withdraw one proposal by id." },
			stats: { type: "boolean", description: "Show the statistics." },
			kind: { type: "string", description: "Filter the list by kind." },
			path: { type: "string", description: "Filter the list by path." },
			status: {
				type: "string",
				description: "Filter the list by status (proposed | withdrawn).",
			},
			limit: {
				type: "number",
				description: "Cap the list (default limitDefault, max limitMaximum).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: { type: "string", required: true },
					found: { type: "boolean" },
					proposal: { type: "json" },
					proposals: { type: "json" },
					statistics: { type: "json" },
				},
			},
			render: (_args, value) => {
				const V = value as {
					action: string;
					found?: boolean;
					proposals?: { id: string; kind: string; path: string; status: string }[];
					statistics?: { proposals: number; refused: number; sequence: number };
				};
				switch (true) {
					case V.action === "get":
						return [
							{
								type: "text",
								text: V.found ? "found - see the JSON value." : "no such proposal.",
							},
						];
					case V.action === "withdraw":
						return [
							{
								type: "text",
								text: V.found ? "withdrawn." : "no such proposed proposal.",
							},
						];
					case V.action === "stats":
						return [
							{
								type: "text",
								text: `${V.statistics?.proposals} proposals, ${V.statistics?.refused} refused, sequence ${V.statistics?.sequence}.`,
							},
						];
					default:
						return [
							{
								type: "text",
								text:
									(V.proposals ?? [])
										.map((P) => `${P.id} ${P.kind} ${P.path} (${P.status})`)
										.join("\n") || "no proposals.",
							},
						];
				}
			},
		},
		async execute(args, _exec) {
			switch (true) {
				case ReadStr(args, "get").length > 0: {
					const Found = Query.One(State, ReadStr(args, "get"));
					return {
						action: "get",
						found: Found !== undefined,
						...(Found === undefined
							? {}
							: // JSON-projected: the Proposal interface has no string
								// index signature of its own.
								{ proposal: Found as unknown as JsonValue }),
					};
				}
				case ReadStr(args, "withdraw").length > 0:
					return {
						action: "withdraw",
						found: Withdraw(State, ReadStr(args, "withdraw")),
					};
				case Read(args, "stats") === true: {
					const Statistics = Query.Statistics(State);
					return {
						action: "stats",
						// JSON-projected: the Statistics interface has no string
						// index signature of its own.
						statistics: Statistics as unknown as JsonValue,
					};
				}
				default: {
					const Kind = ReadStr(args, "kind");
					const Path = ReadStr(args, "path");
					const Status = ReadStr(args, "status");
					const Limit = Read(args, "limit");
					const Proposals = Query.List(State, {
						...(Kind === "rename" || Kind === "connect" || Kind === "replace"
							? { kind: Kind }
							: {}),
						...(Path.length > 0 ? { path: Path } : {}),
						...(Status === "proposed" || Status === "withdrawn"
							? { status: Status }
							: {}),
						...(typeof Limit === "number" ? { limit: Limit } : {}),
					});
					return {
						action: "list",
						// JSON-projected: the Proposal interface has no string
						// index signature of its own.
						proposals: Proposals as unknown as JsonValue,
					};
				}
			}
		},
	});
