// Tools - the merge hook's one model surface (Function/Tools, the
// live-containers MonitorTools idiom): the tool lives inside its owning
// hook (MERGE.md; the ccr registers ccr_retrieve). The commit action is
// the only write path the hook exposes, and it writes only through the
// factory's Write executor with an explicit version fence.
//
//   workspace_merge  - preview | commit | batch | list | stats.
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { JsonValue } from "@deepseek-ai/dsh-util-values";
import Commit from "@Function/Commit.js";
import PreviewFn from "@Function/Preview.js";
import * as Query from "@Function/Query.js";
import type State from "@Interface/State.js";

const Read = (Args: unknown, Key: string): unknown =>
	Args !== null && typeof Args === "object" ? (Args as Record<string, unknown>)[Key] : undefined;

const ReadStr = (Args: unknown, Key: string): string => {
	const Value = Read(Args, Key);
	return typeof Value === "string" ? Value : "";
};

/** Normalize the operations argument (an array of {path, content, version}). */
const Operations = (Args: unknown): { path: string; content: string; version: string }[] => {
	const Raw = Read(Args, "operations");
	if (!Array.isArray(Raw)) {
		return [];
	}
	return Raw.filter(
		(Op): Op is { path: string; content: string; version: string } =>
			Op !== null &&
			typeof Op === "object" &&
			typeof (Op as Record<string, unknown>)["path"] === "string" &&
			typeof (Op as Record<string, unknown>)["content"] === "string" &&
			typeof (Op as Record<string, unknown>)["version"] === "string",
	) as { path: string; content: string; version: string }[];
};

export default (State: State) =>
	defineTool({
		name: "workspace_merge",
		description:
			"The batch merge: preview or commit a set of per-file writes through the version-fenced write executor. preview=operations shows the gates (ready/conflict per file) and the digest without writing anything; commit=operations runs the atomic gates then writes file by file - every file needs {path, content, version} with the version fence you saw, and an unfenced or stale batch is rejected (all-or-nothing) or reported per file (survivors). batch=id shows a past batch's per-file replies; list shows all recorded batches; stats shows the honest counts. A conflict is reported with expected and observed versions - never guessed, never overwritten.",
		parameters: {
			operations: {
				type: "array",
				description:
					"The batch: an array of { path, content, version } - content is the file's full new text, version is the fence.",
			},
			preview: {
				type: "boolean",
				description: "Evaluate the gates and digest without writing.",
			},
			commit: { type: "boolean", description: "Run the gates and write the batch." },
			id: { type: "string", description: "An explicit batch id (optional)." },
			batch: { type: "string", description: "Show one recorded batch by id." },
			list: { type: "boolean", description: "List all recorded batches." },
			stats: { type: "boolean", description: "Show the statistics." },
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: { type: "string", required: true },
					ok: { type: "boolean" },
					id: { type: "string" },
					reason: { type: "string" },
					replies: { type: "array" },
					statistics: { type: "json" },
					record: { type: "json" },
					digest: { type: "string" },
				},
			},
			render: (_args, value) => {
				const V = value as {
					action: string;
					ok?: boolean;
					id?: string;
					reason?: string;
					replies?: { path: string; status: string; version?: string }[];
				};
				switch (true) {
					case V.action === "preview":
						return [
							{
								type: "text",
								text: V.ok
									? `ready (${(V.replies ?? []).length} files, id ${V.id}) - digest in the JSON value.`
									: `not ready: ${V.reason}`,
							},
						];
					case V.action === "commit":
						return [
							{
								type: "text",
								text:
									`batch ${V.id}: ${(V.replies ?? []).map((R) => `${R.path} ${R.status}`).join(", ")}` +
									(V.reason !== undefined ? ` (${V.reason})` : ""),
							},
						];
					case V.action === "batch":
						return [
							{
								type: "text",
								text:
									V.ok === false
										? `no such batch ${V.id}.`
										: "see the JSON value.",
							},
						];
					case V.action === "list":
						return [
							{
								type: "text",
								text:
									(V.replies ?? [])
										.map(
											(R) =>
												`${R.path} ${R.status}${R.version ? ` @ ${R.version}` : ""}`,
										)
										.join("\n") || "no batches.",
							},
						];
					default:
						return [{ type: "text", text: "see the JSON value." }];
				}
			},
		},
		async execute(args, _exec) {
			const RequestedId = ReadStr(args, "id");
			const Request = {
				...(RequestedId.length > 0 ? { id: RequestedId } : {}),
				operations: Operations(args),
			};
			switch (true) {
				case Read(args, "stats") === true:
					// JSON-projected: the Statistics interface has no string
					// index signature of its own.
					return {
						action: "stats",
						statistics: Query.Statistics(State) as unknown as JsonValue,
					};
				case ReadStr(args, "batch").length > 0: {
					const Found = Query.One(State, ReadStr(args, "batch"));
					return {
						action: "batch",
						id: ReadStr(args, "batch"),
						ok: Found !== undefined,
						...(Found === undefined ? {} : { record: Found as unknown as JsonValue }),
					};
				}
				case Read(args, "list") === true:
					return {
						action: "list",
						// JSON-projected: the Reply interface has no string
						// index signature of its own.
						replies: Query.All(State).flatMap(
							(Entry) => Entry.replies,
						) as unknown as JsonValue[],
					};
				case Read(args, "commit") === true: {
					const Result = await Commit(State, Request);
					return {
						action: "commit",
						id: Result.id,
						ok: Result.status === "applied",
						...(Result.reason === undefined ? {} : { reason: Result.reason }),
						// JSON-projected: the Reply interface has no string
						// index signature of its own.
						replies: Result.replies as unknown as JsonValue[],
					};
				}
				default: {
					const Result = await PreviewFn(State, Request);
					return {
						action: "preview",
						id: Result.id,
						ok: Result.ok,
						...(Result.reason === undefined ? {} : { reason: Result.reason }),
						// JSON-projected: the preview's file type has no string
						// index signature of its own.
						replies: Result.files as unknown as JsonValue[],
						digest: Result.digest,
					};
				}
			}
		},
	});
