// Drain - the queue -> SQLite transaction (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 1, 14 and 16.1): the session/flush listener's
// engine. One flush folds one session's queued events into the ledger inside
// ONE transaction: the session and project dimensions adopted from the session
// header, the Call row per assistant/message that carries usage (priced at the
// price row in force at the call's own time, with the cache split's
// CacheSaving), the Touch rows per tool/call (written the moment their Call
// row exists, pending until then, each with its Stage and ReadBeforeEdit
// derived from the file's own prior touches in the session), the ContextMass
// rows from the surface replay (which now splits the cached prefix from the
// uncached remainder), the Allocation rows from the attribution model
// (allocated when the step ends, or at the end of the batch as the safety
// net), the Verdict row per (session, file) when the session ends, and the
// session Cursor advanced to the highest sequence folded. The call's own
// pricing dimensions (section 17.1) - Mode, Region and the resolved tier -
// are written on the Call row, and the cache split's CacheSaving is
// measured against the modifier-adjusted rates (section 17.2). The v4 grain
// rides the same fold: the Edit rows per touch (section 17.3), read from the
// tool call's own arguments, and the telemetry columns on the Call row
// (section 17.4), read from the batch's records up to each message. Every
// insert
// is INSERT OR IGNORE against the DDL's unique keys (the Verdict is
// REPLACE), so draining the same events twice writes the same rows and no
// duplicates. The drain never throws into the parallel dispatch: one failed
// batch rolls back whole and logs one line.
import { basename } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";

import type Config from "../Interface/Config.js";
import type Touched from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";
import Allocate from "./Allocate.js";
import Edit from "./Edit.js";
import Mass from "./Mass.js";
import Price from "./Price.js";
import StageOf from "./Stage.js";
import Telemetry from "./Telemetry.js";
import Touch from "./Touch.js";

type EventRecord = {
	type?: unknown;
	data?: unknown;
	seq?: unknown;
	time?: unknown;
	id?: unknown;
};

type Costed = {
	Input: number;
	Output: number;
	CacheRead: number;
	CacheWrite: number;
	Reasoning: number;
	Total: number;
	Currency: string;
};

// One parsed file interaction, exactly what the arguments parser returns.
type TouchRow = { Path: string; Kind: "read" | "write" | "edit" | "delete" | "search" };

// One tool/call's touches, waiting for the Call row they attach to.
type PendingCall = {
	CallKey: string;
	Tool: string;
	Arguments: string;
	Seq: number;
	At: number;
	Touched: readonly TouchRow[];
};

// One priced call, waiting for the step's touches to be complete.
type AwaitedCall = {
	CallId: number;
	Turn: number;
	Step: number;
	At: number;
	Usage: Usage;
	Costed: Costed;
	Surface: number;
	PerPath: Map<string, number>;
	Cached: Map<string, number>;
	CachedSurface: number;
};

// The mutating kinds: the touches whose stage the classifier reads as an
// edit (section 16.1) and whose presence makes a file's verdict "changed".
const WriteKind = (Kind: string): boolean =>
	Kind === "write" || Kind === "edit" || Kind === "delete" || Kind === "move";

// The cache split's saving (section 2.2 and section 11's ring C): the reads
// the cache made cheaper, minus the cache-write premium when the provider
// charges one - zero when the price row carries no cache rates.
const Saving = (
	CacheRead: number,
	CacheWrite: number,
	Rate: { InputRate: number; CacheReadRate: number | null; CacheWriteRate: number | null },
): number => {
	const Read =
		Rate.CacheReadRate === null ? 0 : (CacheRead * (Rate.InputRate - Rate.CacheReadRate)) / 1e6;
	const Write =
		Rate.CacheWriteRate === null || Rate.CacheWriteRate <= Rate.InputRate
			? 0
			: (CacheWrite * (Rate.CacheWriteRate - Rate.InputRate)) / 1e6;
	return Read - Write;
};

// One file's verdict at session end (section 14): a file whose last
// write-kind touch is a revert is "reverted", a file with any write-kind
// touch is "changed", a file with only read-kind touches is "read".
const VerdictOf = (Kinds: readonly string[]): string => {
	const Last = Kinds.reduce((Found, Kind, Index) => (WriteKind(Kind) ? Index : Found), -1);
	switch (true) {
		case Last < 0:
			return "read";
		default: {
			const Current = Kinds[Last] ?? "";
			const Staged = StageOf(Kinds.slice(0, Last), Current, false);
			return Staged === "revert" ? "reverted" : "changed";
		}
	}
};

// The session identity: the subject's own id first, then the session header
// record in the batch.
const Identify = (Session: unknown, Records: readonly EventRecord[]): string | undefined => {
	const Subject = Session as { id?: unknown } | undefined;
	if (typeof Subject?.id === "string" && Subject.id.length > 0) {
		return Subject.id;
	}
	for (const Record of Records) {
		if (Record.type === "session" && typeof Record.id === "string" && Record.id.length > 0) {
			return Record.id;
		}
	}
	return undefined;
};

export default (Context: Context, Database: DatabaseSync, Config: Config) => {
	// The estimator: the harness token meter's estimateMessage where probed
	// (the design document's estimator for replay). An absent or throwing
	// meter prices every message at zero, which empties the per-file masses
	// and sends the whole input half to the unattributed bucket - the
	// conservation law still holds.
	const Estimate = (Message: unknown): number => {
		const Meter = (Context as unknown as Record<string, unknown>)["tokenMeter"] as
			{ estimateMessage?: (message: unknown) => number } | undefined;
		if (typeof Meter?.estimateMessage !== "function") {
			return 0;
		}
		try {
			const Tokens = Math.ceil(Number(Meter.estimateMessage(Message)) || 0);
			return Tokens > 0 ? Tokens : 0;
		} catch {
			return 0;
		}
	};
	const Replay = Mass(Estimate);
	const Book = Price(Database, Config);
	const Cost = Book.Cost;

	const SelectCursor = Database.prepare("SELECT LastSeq FROM Cursor WHERE SessionId = ?");
	const WriteCursor = Database.prepare(
		"INSERT INTO Cursor (SessionId, LastSeq, UpdatedAt) VALUES (?, ?, ?) " +
			"ON CONFLICT(SessionId) DO UPDATE SET LastSeq = excluded.LastSeq, UpdatedAt = excluded.UpdatedAt",
	);
	const InsertClient = Database.prepare("INSERT OR IGNORE INTO Client (Name) VALUES (?)");
	const SelectClient = Database.prepare("SELECT ClientId FROM Client WHERE Name = ?");
	const SelectProject = Database.prepare("SELECT ProjectId FROM Project WHERE Root = ?");
	const InsertProject = Database.prepare(
		"INSERT OR IGNORE INTO Project (ClientId, Name, Root) VALUES (?, ?, ?)",
	);
	const UpsertSession = Database.prepare(
		"INSERT INTO Session (SessionId, ProjectId, ParentSessionId, Origin, DelegationDepth, AgentPreset, Cwd, Title, CreatedAt) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
			"ON CONFLICT(SessionId) DO UPDATE SET " +
			"ProjectId = COALESCE(excluded.ProjectId, ProjectId), " +
			"ParentSessionId = COALESCE(excluded.ParentSessionId, ParentSessionId), " +
			"Origin = COALESCE(excluded.Origin, Origin), " +
			"DelegationDepth = COALESCE(excluded.DelegationDepth, DelegationDepth), " +
			"AgentPreset = COALESCE(excluded.AgentPreset, AgentPreset), " +
			"Cwd = COALESCE(excluded.Cwd, Cwd), " +
			"Title = COALESCE(excluded.Title, Title)",
	);
	const SelectCall = Database.prepare(
		"SELECT CallId FROM Call WHERE SessionId = ? AND Turn = ? AND Step = ?",
	);
	const InsertCall = Database.prepare(
		"INSERT OR IGNORE INTO Call (SessionId, Turn, Step, Seq, Provider, Model, PriceId, InputTokens, OutputTokens, " +
			"CacheReadTokens, CacheWriteTokens, ReasoningTokens, TotalTokens, CostInput, CostOutput, CostCacheRead, " +
			"CostCacheWrite, CostReasoning, CostTotal, Currency, SurfaceTokens, CacheSaving, At, Mode, Region, Tier, " +
			"LatencyMs, FirstTokenMs, TokensPerSecond, Attempts, ErrorCode, ContextWindow, Utilization) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);
	const SelectPriceId = Database.prepare(
		"SELECT PriceId FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom = ? " +
			"ORDER BY PriceId DESC LIMIT 1",
	);
	const SelectFile = Database.prepare("SELECT FileId FROM File WHERE ProjectId = ? AND Path = ?");
	const InsertFile = Database.prepare(
		"INSERT OR IGNORE INTO File (ProjectId, Path, FirstSeenAt) VALUES (?, ?, ?)",
	);
	const InsertTouch = Database.prepare(
		"INSERT OR IGNORE INTO Touch (CallId, SessionId, Turn, Step, CallKey, Tool, FileId, Kind, Stage, ReadBeforeEdit, Seq, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);
	const SelectTouchId = Database.prepare(
		"SELECT TouchId FROM Touch WHERE SessionId = ? AND CallKey = ? AND FileId = ?",
	);
	const InsertEdit = Database.prepare(
		"INSERT OR IGNORE INTO Edit (TouchId, Ordinal, LinesAdded, LinesRemoved, BytesAdded, BytesRemoved, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?)",
	);
	const InsertVerdict = Database.prepare(
		"INSERT OR REPLACE INTO Verdict (SessionId, FileId, State, LinesAdded, LinesRemoved, At) " +
			"VALUES (?, ?, ?, ?, ?, ?)",
	);
	const InsertMass = Database.prepare(
		"INSERT OR IGNORE INTO ContextMass (CallId, FileId, Tokens) VALUES (?, ?, ?)",
	);
	const SelectTouches = Database.prepare(
		"SELECT Touch.Kind AS Kind, Touch.BytesDelta AS BytesDelta, File.Path AS Path " +
			"FROM Touch JOIN File ON File.FileId = Touch.FileId WHERE Touch.CallId = ?",
	);
	const SelectAllocated = Database.prepare("SELECT 1 FROM Allocation WHERE CallId = ? LIMIT 1");
	const InsertAllocation = Database.prepare(
		"INSERT OR IGNORE INTO Allocation (CallId, FileId, DirectCost, AmortizedCost, ContextTokens, SurfaceTokens, Weight, Method, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);

	// The per-session replay state, held across flushes: the surface buffer
	// every later call's mass is replayed over (bounded by the session's own
	// length), the pending touch sets, the awaiting calls, and the per-file
	// ordered touch kinds every later touch's stage and the session's
	// verdicts read (section 16.1).
	const Surfaces = new Map<string, unknown[]>();
	const Pending = new Map<string, Map<string, PendingCall[]>>();
	const Awaiting = new Map<string, Map<string, AwaitedCall>>();
	const Histories = new Map<string, Map<string, string[]>>();
	const Folded = new Set<number>();

	// One assistant/message's usage record, read from the event's own fields:
	// the TokenUsage buckets (a missing bucket is null, charged at zero) and
	// the provider and model the call's own source block names.
	const UsageOf = (
		Data: Record<string, unknown>,
		Turn: number,
		Step: number,
		Seq: number,
		At: number,
	): Usage | undefined => {
		const Raw = Data["usage"];
		if (Raw === null || typeof Raw !== "object") {
			return undefined;
		}
		const Buckets = Raw as Record<string, unknown>;
		const Input = Number(Buckets["inputTokens"]);
		const Output = Number(Buckets["outputTokens"]);
		if (!Number.isFinite(Input) || !Number.isFinite(Output)) {
			return undefined;
		}
		const Bucket = (Key: string): number | null => {
			const Value = Number(Buckets[Key]);
			return Number.isFinite(Value) ? Math.round(Value) : null;
		};
		const Source = (Data["message"] as { source?: unknown } | undefined)?.source;
		const Named = Source as { provider?: unknown; model?: unknown } | undefined;
		const Provider = Named?.provider;
		const Model = Named?.model;
		// The factor layer's dimensions (section 17.1): the log's own mode
		// and region signals when it carries them - Mode defaults to
		// "standard", Region stays NULL when the log has no signal.
		const ModeRaw = Data["mode"];
		const RegionRaw = Data["region"];
		return {
			SessionId: "",
			Turn: Math.round(Turn),
			Step: Math.round(Step),
			Seq: Math.round(Seq),
			Provider: typeof Provider === "string" && Provider.length > 0 ? Provider : "unknown",
			Model: typeof Model === "string" && Model.length > 0 ? Model : "unknown",
			InputTokens: Math.round(Input),
			OutputTokens: Math.round(Output),
			CacheReadTokens: Bucket("cacheReadTokens"),
			CacheWriteTokens: Bucket("cacheWriteTokens"),
			ReasoningTokens: Bucket("reasoningTokens"),
			TotalTokens: Bucket("totalTokens"),
			At: Math.round(At),
			Mode: typeof ModeRaw === "string" && ModeRaw.length > 0 ? ModeRaw : "standard",
			Region: typeof RegionRaw === "string" && RegionRaw.length > 0 ? RegionRaw : null,
		};
	};

	return (Session: unknown, Events: readonly unknown[]): void => {
		try {
			const Records = (Events as EventRecord[]).filter(
				(Event) => Event !== null && typeof Event === "object" && Event.type !== undefined,
			);
			if (Records.length === 0) {
				return;
			}
			const SessionId = Identify(Session, Records);
			if (SessionId === undefined) {
				return;
			}
			let Cwd = process.cwd();
			const SubjectCwd = (Session as { cwd?: unknown } | undefined)?.cwd;
			if (typeof SubjectCwd === "string" && SubjectCwd.length > 0) {
				Cwd = SubjectCwd;
			}
			let Project: number | undefined;
			const CursorRow = SelectCursor.get(SessionId) as { LastSeq: unknown } | undefined;
			const LastSeq = typeof CursorRow?.LastSeq === "number" ? CursorRow.LastSeq : 0;
			let Reached = LastSeq;
			let Turn = 0;

			// --- the per-batch helpers, closed over the batch's session -------

			// The project: resolved from the session's cwd (the header's, else
			// the drain-time cwd) and created on first sight under the
			// configured client, exactly like the entry does for its own cwd.
			const ProjectOf = (): number | undefined => {
				if (Project !== undefined) {
					return Project;
				}
				InsertClient.run(Config.client);
				const Client = SelectClient.get(Config.client) as { ClientId: unknown } | undefined;
				if (typeof Client?.ClientId !== "number") {
					return undefined;
				}
				InsertProject.run(Client.ClientId, basename(Cwd), Cwd);
				const Found = SelectProject.get(Cwd) as { ProjectId: unknown } | undefined;
				Project = typeof Found?.ProjectId === "number" ? Found.ProjectId : undefined;
				return Project;
			};

			// The session dimension: created or completed from whatever this
			// event reveals (the header carries the identity fields; an
			// assistant message may be the first event a mid-session drain
			// ever sees). The header is FLAT - its fields sit on the record
			// itself, not under data - so both levels are read. COALESCE keeps
			// the first known value of each field.
			const Adopt = (
				Record: EventRecord,
				Data: Record<string, unknown>,
				At: number,
			): void => {
				const Header = Record as Record<string, unknown>;
				const Pick = (Key: string): unknown => Data[Key] ?? Header[Key];
				const Home = Pick("cwd");
				const Next = typeof Home === "string" && Home.length > 0 ? Home : Cwd;
				if (Next !== Cwd) {
					Cwd = Next;
					Project = undefined;
				}
				const Origin = Pick("origin");
				const Parent = Pick("parentSession");
				const DepthRaw = Pick("delegationDepth");
				const Depth = typeof DepthRaw === "number" ? Math.round(DepthRaw) : null;
				const Preset = Pick("agentPreset");
				const Title = Pick("title");
				const CreatedRaw = Pick("createdAt");
				const Created =
					typeof CreatedRaw === "number" ? Math.round(CreatedRaw) : Math.round(At);
				UpsertSession.run(
					SessionId,
					ProjectOf() ?? null,
					typeof Parent === "string" ? Parent : null,
					typeof Origin === "string" ? Origin : null,
					Depth,
					typeof Preset === "string" ? Preset : null,
					Next,
					typeof Title === "string" ? Title : null,
					Created,
				);
			};

			// The file dimension: one path of the session's project, created on
			// first sight; the id, or null when the project could not resolve.
			const Filed = (Path: string, At: number): number | null => {
				const ProjectId = ProjectOf();
				if (ProjectId === undefined) {
					return null;
				}
				InsertFile.run(ProjectId, Path, Math.round(At));
				const Found = SelectFile.get(ProjectId, Path) as { FileId: unknown } | undefined;
				return typeof Found?.FileId === "number" ? Found.FileId : null;
			};

			const Called = (Turn: number, Step: number): number | undefined => {
				const Found = SelectCall.get(SessionId, Math.round(Turn), Math.round(Step)) as
					{ CallId: unknown } | undefined;
				return typeof Found?.CallId === "number" ? Found.CallId : undefined;
			};

			const WriteTouches = (
				CallId: number,
				Turn: number,
				Step: number,
				Entry: PendingCall,
			): void => {
				const History = Histories.get(SessionId) ?? new Map<string, string[]>();
				Histories.set(SessionId, History);
				for (const Row of Entry.Touched) {
					const FileId = Filed(Row.Path, Entry.At);
					if (FileId === null) {
						continue;
					}
					// the stage and the read-before-edit flag (section 16.1):
					// derived from the file's own prior touch kinds in this
					// session. The restore signal is not carried by the current
					// log shape, so the classifier's revert rule is fed false
					// until a hash-aware touch arrives - the Verdict's reverted
					// state recomputes when one does.
					const Prior = History.get(Row.Path) ?? [];
					const Staged = StageOf(Prior, Row.Kind, false);
					const Read =
						WriteKind(Row.Kind) && Prior.some((Kind) => Kind === "read") ? 1 : 0;
					InsertTouch.run(
						CallId,
						SessionId,
						Math.round(Turn),
						Math.round(Step),
						Entry.CallKey,
						Entry.Tool,
						FileId,
						Row.Kind,
						Staged,
						Read,
						Entry.Seq,
						Entry.At,
					);
					const Seen = History.get(Row.Path) ?? [];
					Seen.push(Row.Kind);
					History.set(Row.Path, Seen);
					// the edit grain (section 17.3): the hunks the tool call
					// produced, read from its own arguments and inserted
					// against the touch they belong to - a non-edit tool's
					// arguments parse to no rows, so the insert is skipped
					const Held = SelectTouchId.get(SessionId, Entry.CallKey, FileId) as
						{ TouchId: unknown } | undefined;
					const TouchId = typeof Held?.TouchId === "number" ? Held.TouchId : undefined;
					if (TouchId === undefined) {
						continue;
					}
					for (const Hunk of Edit(Entry.Tool, Entry.Arguments, Entry.At)) {
						InsertEdit.run(
							TouchId,
							Hunk.Ordinal,
							Hunk.LinesAdded,
							Hunk.LinesRemoved,
							Hunk.BytesAdded,
							Hunk.BytesRemoved,
							Hunk.At,
						);
					}
				}
			};

			const Pend = (Turn: number, Step: number, Entry: PendingCall): void => {
				const BySession = Pending.get(SessionId) ?? new Map<string, PendingCall[]>();
				const Key = `${Math.round(Turn)}:${Math.round(Step)}`;
				const Queued = BySession.get(Key) ?? [];
				Queued.push(Entry);
				BySession.set(Key, Queued);
				Pending.set(SessionId, BySession);
			};

			// The pending touches resolved: a pending set is written the moment
			// its Call row exists - at the tool result that completes the call,
			// or at the assistant message that writes the call row.
			const Release = (Turn: number, Step: number): void => {
				const BySession = Pending.get(SessionId);
				const Key = `${Math.round(Turn)}:${Math.round(Step)}`;
				const Queued = BySession?.get(Key);
				if (Queued === undefined) {
					return;
				}
				const CallId = Called(Turn, Step);
				if (CallId === undefined) {
					return;
				}
				for (const Entry of Queued) {
					WriteTouches(CallId, Turn, Step, Entry);
				}
				BySession?.delete(Key);
			};

			const Await = (Entry: AwaitedCall): void => {
				const BySession = Awaiting.get(SessionId) ?? new Map<string, AwaitedCall>();
				BySession.set(`${Entry.Turn}:${Entry.Step}`, Entry);
				Awaiting.set(SessionId, BySession);
			};

			// One call's allocation: the ledger's own Touch rows (every touch of
			// the step is written by now) replayed through the allocator, the
			// money inserted against the call, the call marked folded. The
			// double guard (this drain's own set, then the ledger's) makes a
			// repeated fold a no-op, so a step that ends twice is never
			// double-counted.
			const Fold = (Entry: AwaitedCall): void => {
				if (Folded.has(Entry.CallId) || SelectAllocated.get(Entry.CallId) !== undefined) {
					Folded.add(Entry.CallId);
					return;
				}
				const Touched: Touched[] = [];
				for (const Row of SelectTouches.all(Entry.CallId) as {
					Kind: unknown;
					BytesDelta: unknown;
					Path: unknown;
				}[]) {
					if (typeof Row.Path !== "string" || typeof Row.Kind !== "string") {
						continue;
					}
					Touched.push({
						SessionId,
						Turn: Entry.Turn,
						Step: Entry.Step,
						Seq: 0,
						CallKey: "",
						Tool: "",
						Path: Row.Path,
						Kind: Row.Kind as Touched["Kind"],
						BytesBefore: null,
						BytesAfter: null,
						BytesDelta: typeof Row.BytesDelta === "number" ? Row.BytesDelta : null,
					});
				}
				const Rows = Allocate(
					Entry.Usage,
					Entry.Costed,
					Touched,
					{
						Surface: Entry.Surface,
						PerPath: Entry.PerPath,
						Cached: Entry.Cached,
						CachedSurface: Entry.CachedSurface,
					},
					Config,
				);
				for (const Row of Rows) {
					const FileId = Row.Path === null ? null : Filed(Row.Path, Entry.At);
					InsertAllocation.run(
						Entry.CallId,
						FileId,
						Row.DirectCost,
						Row.AmortizedCost,
						Math.round(Row.ContextTokens),
						Math.round(Row.SurfaceTokens),
						Row.Weight,
						Row.Method,
						Entry.At,
					);
				}
				Folded.add(Entry.CallId);
			};

			const Priced = (
				Provider: string,
				Model: string,
				EffectiveFrom: number,
			): number | null => {
				const Found = SelectPriceId.get(Provider, Model, EffectiveFrom) as
					{ PriceId: unknown } | undefined;
				return typeof Found?.PriceId === "number" ? Found.PriceId : null;
			};

			// --- the fold: one transaction over the whole batch ---------------
			Database.exec("BEGIN IMMEDIATE");
			try {
				for (let Index = 0; Index < Records.length; Index++) {
					const Record = Records[Index];
					if (Record === undefined) {
						continue;
					}
					const Seq = typeof Record.seq === "number" ? Record.seq : -1;
					if (Seq >= 0) {
						if (Seq <= LastSeq) {
							continue;
						}
						if (Seq > Reached) {
							Reached = Seq;
						}
					}
					const Type = typeof Record.type === "string" ? Record.type : "";
					const Data = (Record.data ?? {}) as Record<string, unknown>;
					const At = typeof Record.time === "number" ? Record.time : Date.now();
					switch (true) {
						case Type === "session": {
							Adopt(Record, Data, At);
							break;
						}
						case Type === "turn/start": {
							if (typeof Data["turn"] === "number") {
								Turn = Data["turn"];
							}
							break;
						}
						case Type === "tool/call": {
							const TurnOfCall =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfCall = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Name = typeof Data["name"] === "string" ? Data["name"] : "";
							const Arguments =
								typeof Data["arguments"] === "string" ? Data["arguments"] : "";
							const Rows = Touch(Name, Arguments, Cwd);
							if (Rows.length === 0) {
								break;
							}
							const Entry: PendingCall = {
								CallKey:
									Seq >= 0 ? String(Seq) : `${TurnOfCall}/${StepOfCall}/${Name}`,
								Tool: Name,
								Arguments,
								Seq: Seq >= 0 ? Seq : 0,
								At: Math.round(At),
								Touched: Rows,
							};
							const CallId = Called(TurnOfCall, StepOfCall);
							if (CallId === undefined) {
								Pend(TurnOfCall, StepOfCall, Entry);
							} else {
								WriteTouches(CallId, TurnOfCall, StepOfCall, Entry);
							}
							break;
						}
						case Type === "tool/result": {
							// the call completed: its pending touches are final
							Release(
								typeof Data["turn"] === "number" ? Data["turn"] : Turn,
								typeof Data["step"] === "number" ? Data["step"] : 0,
							);
							break;
						}
						case Type === "assistant/message": {
							const TurnOfCall =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfCall = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Usage = UsageOf(Data, TurnOfCall, StepOfCall, Seq, At);
							if (Usage === undefined) {
								break;
							}
							// the surface BEFORE this call: the replay covers every
							// surface event folded so far, this one not yet - and
							// the call's cacheReadTokens is the budget the replay
							// splits the cached prefix by (section 2.2)
							const Massed = Replay(
								Surfaces.get(SessionId) ?? [],
								Usage.CacheReadTokens ?? 0,
							);
							const Surface = Math.max(0, Math.round(Massed.Surface));
							const PerPath = new Map<string, number>();
							for (const [Path, Tokens] of Massed.PerPath) {
								PerPath.set(Path, Math.max(0, Math.round(Tokens)));
							}
							const Cached = new Map<string, number>();
							for (const [Path, Tokens] of Massed.Cached) {
								Cached.set(Path, Math.max(0, Math.round(Tokens)));
							}
							const CachedSurface = Math.max(0, Math.round(Massed.CachedSurface));
							Adopt(Record, {}, At);
							// The price row in force at the call's own time, mode
							// and region (section 17.1): the call's own signals,
							// defaulting to standard and any region.
							const Rate = Book.Resolve(
								Usage.Provider,
								Usage.Model,
								Usage.At,
								Usage.Mode ?? "standard",
								Usage.Region ?? null,
							);
							const Costed = Cost(Usage, Rate);
							// The cache split's saving is measured against the
							// modifier-adjusted rates (section 17.2), not the
							// raw ones, so the book's discounts and uplifts
							// move the saving the same way they move the bill.
							const Lift = Book.Applied(
								Usage.Provider,
								Usage.Mode ?? "standard",
								Usage.Model,
								Usage.At,
							);
							const Saved = Saving(
								Usage.CacheReadTokens ?? 0,
								Usage.CacheWriteTokens ?? 0,
								{
									InputRate: Rate.InputRate * Lift,
									CacheReadRate:
										Rate.CacheReadRate === null
											? null
											: Rate.CacheReadRate * Lift,
									CacheWriteRate:
										Rate.CacheWriteRate === null
											? null
											: Rate.CacheWriteRate * Lift,
								},
							);
							// The telemetry the log already carries (section
							// 17.4), read from this batch's records up to and
							// including the message: the retry count, the
							// step-to-message latency, the first stream token,
							// the context window and its utilization, the
							// failure code - and the tokens-per-second rate
							// from the call's own output tokens over it.
							const Measured = Telemetry(Records.slice(0, Index + 1), Surface);
							const PerSecond =
								Measured.LatencyMs !== null && Measured.LatencyMs > 0
									? Usage.OutputTokens / (Measured.LatencyMs / 1000)
									: null;
							InsertCall.run(
								SessionId,
								Usage.Turn,
								Usage.Step,
								Usage.Seq,
								Usage.Provider,
								Usage.Model,
								Priced(Usage.Provider, Usage.Model, Rate.EffectiveFrom),
								Usage.InputTokens,
								Usage.OutputTokens,
								Usage.CacheReadTokens ?? 0,
								Usage.CacheWriteTokens ?? 0,
								Usage.ReasoningTokens ?? 0,
								Usage.TotalTokens,
								Costed.Input,
								Costed.Output,
								Costed.CacheRead,
								Costed.CacheWrite,
								Costed.Reasoning,
								Costed.Total,
								Costed.Currency,
								Surface,
								Saved,
								Usage.At,
								Usage.Mode ?? "standard",
								Usage.Region ?? null,
								Rate.EffectiveFrom === 0 ? null : Rate.TierFrom,
								Measured.LatencyMs,
								Measured.FirstTokenMs,
								PerSecond,
								Measured.Attempts,
								Measured.ErrorCode,
								Measured.ContextWindow,
								Measured.Utilization,
							);
							const CallId = Called(Usage.Turn, Usage.Step);
							if (CallId === undefined) {
								break;
							}
							Release(Usage.Turn, Usage.Step);
							for (const [Path, Tokens] of PerPath) {
								const FileId = Filed(Path, Usage.At);
								if (FileId === null) {
									continue;
								}
								InsertMass.run(CallId, FileId, Tokens);
							}
							Await({
								CallId,
								Turn: Usage.Turn,
								Step: Usage.Step,
								At: Usage.At,
								Usage,
								Costed,
								Surface,
								PerPath,
								Cached,
								CachedSurface,
							});
							break;
						}
						case Type === "step/end": {
							const TurnOfEnd =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfEnd = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Key = `${Math.round(TurnOfEnd)}:${Math.round(StepOfEnd)}`;
							const BySession = Awaiting.get(SessionId);
							const Entry = BySession?.get(Key);
							if (Entry !== undefined) {
								Fold(Entry);
								BySession?.delete(Key);
							}
							break;
						}
						case Type === "session/disposed" || Type === "turn/end": {
							// the session boundary (section 14): the Verdict row
							// per (session, file) from the touch kinds seen so
							// far - REPLACE keeps the latest end's state, so a
							// mid-session turn's premature row is corrected by
							// the final one and the verdict stays recomputable
							// from Touch alone
							const Over = Histories.get(SessionId);
							if (Over !== undefined) {
								for (const [Path, Kinds] of Over) {
									const FileId = Filed(Path, At);
									if (FileId === null) {
										continue;
									}
									InsertVerdict.run(
										SessionId,
										FileId,
										VerdictOf(Kinds),
										0,
										0,
										Math.round(At),
									);
								}
							}
							break;
						}
						default:
					}
					// The surface replay buffer: the four surface kinds, the
					// tool/call records (the callId map's source for later
					// results) and the session header (the cwd the arguments
					// resolve against), kept per session for every later call.
					switch (true) {
						case Type === "session" ||
							Type === "system/message" ||
							Type === "user/message" ||
							Type === "assistant/message" ||
							Type === "tool/result" ||
							Type === "tool/call": {
							const Buffer = Surfaces.get(SessionId) ?? [];
							Buffer.push(Record);
							Surfaces.set(SessionId, Buffer);
							break;
						}
						default:
					}
				}
				// The batch's safety net: a call still awaiting its allocation
				// (its step never ended inside this batch) folds here. The double
				// guard makes any later fold a no-op, so a step whose remaining
				// tool calls arrive in a later batch keeps its already-folded
				// money, and a recompute heals the missing touches.
				const BySession = Awaiting.get(SessionId);
				if (BySession !== undefined) {
					for (const [Key, Entry] of BySession) {
						Fold(Entry);
						BySession.delete(Key);
					}
					Awaiting.delete(SessionId);
				}
				if (Reached > LastSeq) {
					WriteCursor.run(SessionId, Reached, Date.now());
				}
				Database.exec("COMMIT");
			} catch (Failure) {
				try {
					Database.exec("ROLLBACK");
				} catch {
					/* the transaction may have already ended */
				}
				throw Failure;
			}
		} catch (Failure) {
			try {
				(
					Context as unknown as { logger?: { warn?: (message: string) => void } }
				).logger?.warn?.(
					`plugin-dsh-cost: a drain batch was not folded: ${
						Failure instanceof Error ? Failure.message : String(Failure)
					}`,
				);
			} catch {
				/* silence above all */
			}
		}
	};
};
