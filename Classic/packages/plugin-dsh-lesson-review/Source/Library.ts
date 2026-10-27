// Library - the entry module of the LESSON-REVIEW service
// (@playform/plugin-dsh-lesson-review), the self-improvement review of the
// family. Loader contract: the CLASS form, mirroring the pattern service -
// `export default class LessonService extends Service` with
// `super(Context, "lesson")`, registered immediately on construction. The ONLY
// named export is the Config schema (the loader validates it at load; also
// attached as a static for the class-form reading) - every other module is a
// nameless default export and each service method is a thin delegate.
//
// THE SERVICE SURFACE (ctx.lesson):
//
//   Configure(options)        - apply validated config knobs (volatile cells)
//   Tick(agent)               - advance the nudge counter; { due, count }
//   Reset(agent)              - clear one agent's counter
//   Digest(messages)          - the bounded digest (Function/Digest)
//   Prompt(focus?)            - the byte-stable review prompt
//   Parse(reply)              - the strict reply parse (Function/Parse)
//   Judge(proposal)           - the deterministic acceptance rules
//   Snapshot(agent)           - the live-session projection (Function/Snapshot)
//   Review(input)             - ONE review: digest -> llm -> parse -> judge ->
//                               apply/queue -> report -> ledger
//   Curate(now?)              - the deterministic staleness/archive pass
//   Status()                  - counts (total/active/stale/archived/pinned/pending)
//   Pin(name) / Unpin(name)   - the lifecycle exemption
//   Restore(name)             - move an archived skill back and reactivate it
//   Archive(name)             - archive one skill now (the manual pass)
//   Pending()                 - the queued proposals awaiting acceptance
//   Accept(name)              - land one queued proposal
//   Save() / Flush()          - the store flush (the smoke seam)
//
// THE REVIEW NEVER TOUCHES THE LIVE TURN. It runs from the true idle phase
// (the caller's `agent.runMaintenance`), it receives a SNAPSHOT rather than
// reading the session, and its model call is ONE hand-built `ctx.llm.stream`
// request that carries no agent-loop marker - so the harness cannot mistake it
// for a loop request, and its cost is one bounded digest plus one reply.
//
// THE REVIEW PROPOSES BY DEFAULT. `policy.write` is the shipped `approve`, so
// an accepted operation is QUEUED (`~/.dsh/lesson/pending.jsonl`) and lands
// only through `Accept`. `policy.write: auto` is the opt-in that lets a run
// land its own operations, and even then the judge's rules and the exact-file
// fence still apply. Agreement operations are ALWAYS queued: the service never
// writes the user's `AGENTS.md`.
//
// EVERY DEGRADATION IS LOUD AND NON-FATAL: no `llm` service, no model route, a
// disabled service, an unparseable reply, a failed model call - each returns
// an outcome class and writes one ledger line, and none of them throws into the
// caller's maintenance task.
import { existsSync, readFileSync } from "node:fs";
import {
	appendFile as Append,
	mkdir as Mkdir,
	rename as Rename,
	writeFile as WriteFile,
} from "node:fs/promises";
import OS from "node:os";
import { dirname as Dirname, join as Join } from "node:path";

import { Service, type Context } from "@deepseek-ai/cordis";
import { Activate } from "@playform/lib-dsh-core";

import Apply from "./Function/Apply.js";
import Curate, { type Curation } from "./Function/Curate.js";
import Digest, { type DigestResult } from "./Function/Digest.js";
import Judge from "./Function/Judge.js";
import Knobs from "./Function/Knobs.js";
import Parse, { type ParseResult } from "./Function/Parse.js";
import Prompt from "./Function/Prompt.js";
import Report, { type RunReport } from "./Function/Report.js";
import Snapshot from "./Function/Snapshot.js";
import Usage, { Fresh } from "./Function/Usage.js";
import type Configuration from "./Interface/Config.js";
import type { Corpus } from "./Interface/Corpus.js";
import type { Op, Proposal } from "./Interface/Proposal.js";
import type { ReviewInput, ReviewMessage, ReviewResult } from "./Interface/Review.js";
import Definition from "./Variable/Config.js";

/** The bundle version, mirrored from package.json (the activation proof). */
const Version = "0.3.0";

/** Expand a leading `~` (the family's path convention for every knob). */
const Expand = (Path: string): string =>
	Path.startsWith("~") ? Join(OS.homedir(), Path.slice(1)) : Path;

/** The nudge verdict. */
export interface Tick {
	/** Whether a review is due now. */
	due: boolean;
	/** The counter's value after this tick. */
	count: number;
}

/** One queued proposal (the pending queue's row). */
export interface Queued {
	/** Epoch ms when it was queued. */
	at: number;
	/** The operation. */
	op: Op;
}

/** The corpus-wide counts. */
export interface Status {
	total: number;
	active: number;
	stale: number;
	archived: number;
	pinned: number;
	pending: number;
}

/** The neutral ledger line builder (module-owned strings, byte-stable). */
const Line = (Message: string, State: { logFile: string }): string =>
	`lesson: ${Message} (logFile ${State.logFile})`;

export default class LessonService extends Service {
	static inject: string[] = [];

	/** The loader-contract Config (validated at load; knobs via Configure). */
	static Config = Definition;

	/** The knobs: constructor defaults plus the loader's validated config. */
	private Knobs: Configuration;

	/** The usage store (Function/Usage). */
	private Usage: Usage;

	/** The ledger sink (best-effort, never throws). */
	private Ledger: (Message: string) => void;

	/** The per-agent nudge counters (the agent object is the key). */
	private Counters: Map<unknown, number> = new Map();

	/** The store chain: the load and every write, in order. */
	private Chain: Promise<void> = Promise.resolve();

	/** The harness context (the optional `llm` probe). */
	private Context: Context;

	constructor(Context_: Context, Raw?: unknown) {
		super(Context_, "lesson");
		this.Context = Context_;
		this.Knobs = Knobs(Raw);
		this.Usage = new Usage(Expand(this.Knobs.storagePath));
		this.Ledger = (Message: string): void => {
			try {
				Context_.logger?.info(Line(Message, this.Knobs));
			} catch {
				/* logger optional */
			}
		};
		this.Ledger(
			this.Knobs.enabled
				? Activate([
						["bundle", Version],
						["interval", `${this.Knobs.intervalTurns} turns`],
						["corpus", this.Knobs.skillsRoot],
						["write", this.Knobs.policy.write],
					])
				: "disabled (enabled=false)",
		);
		// The store load runs detached (a constructor cannot await); every
		// mutation serialises behind it, so a review never sees a half store.
		this.Chain = this.Chain.then(async () => {
			const Loaded = await this.Usage.Load();
			switch (true) {
				case Loaded.error !== undefined:
					this.Ledger(`usage store unreadable: ${Loaded.error}; starting empty`);
					break;
				case Loaded.loaded > 0:
					this.Ledger(`restored ${Loaded.loaded} usage records`);
					break;
				default:
					break;
			}
		});
	}

	/** Apply the validated config knobs (called by the host on load/volatile). */
	Configure(Options: Partial<Configuration>): void {
		this.Knobs = { ...this.Knobs, ...Options };
	}

	/** Advance one agent's nudge counter; `due` is true on the interval. */
	Tick(Agent: unknown): Tick {
		switch (true) {
			case !this.Knobs.enabled:
				return { due: false, count: 0 };
			case this.Knobs.intervalTurns <= 0:
				return { due: false, count: 0 };
			default:
				break;
		}
		const Count = (this.Counters.get(Agent) ?? 0) + 1;
		switch (true) {
			case Count >= this.Knobs.intervalTurns:
				this.Counters.set(Agent, 0);
				this.Ledger(`due after ${Count} turns`);
				return { due: true, count: Count };
			default:
				this.Counters.set(Agent, Count);
				return { due: false, count: Count };
		}
	}

	/** Clear one agent's counter (a new session, or a manual reset). */
	Reset(Agent: unknown): void {
		this.Counters.delete(Agent);
	}

	/** The bounded digest of one conversation snapshot. */
	Digest(Messages: readonly ReviewMessage[]): DigestResult {
		return Digest(Messages, this.Knobs.digestTail, this.Knobs.maxInputChars);
	}

	/** The review prompt (a `promptFile` override wins over the shipped text). */
	Prompt(Focus?: string): string {
		const Override = this.Knobs.promptFile.trim();
		switch (true) {
			case Override === "":
				return Prompt(Focus);
			default: {
				try {
					const Text = readFileSync(Expand(Override), "utf8").trim();
					const Trimmed = (Focus ?? "").trim();
					return Trimmed === "" ? Text : `${Text}\n\n${Trimmed}`;
				} catch (Cause) {
					this.Ledger(
						`promptFile unreadable: ${(Cause as Error).message}; using the shipped prompt`,
					);
					return Prompt(Focus);
				}
			}
		}
	}

	/** The strict reply parse. */
	Parse(Reply: string): ParseResult {
		return Parse(Reply, this.Knobs.maxProposals);
	}

	/** The deterministic acceptance rules, over the live corpus. */
	Judge(Proposal_: Proposal) {
		return Judge(Proposal_, this.Corpus());
	}

	/** The live-session projection (the integration seam; never throws). */
	Snapshot(Agent: unknown): ReviewMessage[] {
		return Snapshot(Agent);
	}

	/** One review. Never throws; every degradation is an outcome class. */
	async Review(Input: ReviewInput): Promise<ReviewResult> {
		const Started = Date.now();
		const Result: ReviewResult = {
			outcome: "unavailable",
			applied: [],
			proposed: [],
			rejected: [],
			report: "",
		};
		switch (true) {
			case !this.Knobs.enabled:
				return this.Settle(Input, Result, "unavailable", "disabled", Started);
			default:
				break;
		}
		const Llm = this.Context.get?.("llm") as
			{ stream?: (Options: unknown) => AsyncIterable<unknown> } | undefined;
		switch (true) {
			case Llm === undefined || typeof Llm.stream !== "function":
				return this.Settle(Input, Result, "unavailable", "no llm service", Started);
			default:
				break;
		}
		const Route = this.Route(Input.Agent);
		switch (true) {
			case Route === undefined:
				return this.Settle(Input, Result, "unavailable", "no model route", Started);
			default:
				break;
		}
		const Messages = Array.isArray(Input.Messages) ? Input.Messages : [];
		switch (true) {
			case Messages.length === 0:
				return this.Settle(Input, Result, "unavailable", "empty snapshot", Started);
			default:
				break;
		}
		const Digest_ = this.Digest(Messages);
		const Instruction = this.Prompt(Input.Focus);
		let Reply = "";
		try {
			const Stream = Llm.stream({
				provider: Route.provider,
				model: Route.model,
				messages: [
					{
						role: "user",
						content: [{ type: "text", text: `${Digest_.text}\n\n${Instruction}` }],
					},
				],
				maxTokens: this.Knobs.maxTokens,
				signal: Input.Signal,
			});
			for await (const Chunk of Stream) {
				const Frame = Chunk as { type?: string; text?: string };
				switch (true) {
					case Frame?.type === "text-delta" && typeof Frame.text === "string":
						Reply += Frame.text;
						break;
					default:
						break;
				}
			}
		} catch (Cause) {
			return this.Settle(
				Input,
				Result,
				"failed",
				`model call failed: ${(Cause as Error)?.message ?? String(Cause)}`,
				Started,
				Route,
				Digest_,
			);
		}
		const Parsed = this.Parse(Reply);
		switch (true) {
			case !Parsed.ok:
				return this.Settle(Input, Result, "failed", Parsed.error, Started, Route, Digest_);
			default:
				break;
		}
		const Proposal_ = Parsed.proposal;
		switch (true) {
			case Proposal_.ops.length === 0:
				Result.outcome = "nothing";
				Result.report = await this.Record(
					Input,
					Result,
					Route,
					Digest_,
					Proposal_,
					Started,
				);
				this.Ledger("nothing to save");
				await this.Save();
				return Result;
			default:
				break;
		}
		const Verdict = Judge(Proposal_, this.Corpus());
		const Now = Date.now();
		for (const Op of Verdict.accepted) {
			// The agreement store is the user's file: always a proposal.
			switch (true) {
				case Op.op === "agreement":
					await this.Enqueue(Op, Now);
					Result.proposed.push(Op.name);
					continue;
				case this.Knobs.policy.write !== "auto":
					await this.Enqueue(Op, Now);
					Result.proposed.push(Op.name);
					continue;
				default:
					break;
			}
			const Applied = await Apply(Op, this.Knobs);
			switch (true) {
				case Applied.ok:
					this.Usage.Touch(Op.name, "patch", Now);
					Result.applied.push(Op.name);
					this.Ledger(`applied ${Op.op} ${Op.name} -> ${Applied.path}`);
					break;
				default:
					Result.rejected.push({ name: Op.name, rule: Applied.error });
					this.Ledger(`refused ${Op.name} (${Applied.error})`);
			}
		}
		for (const Refused of Verdict.rejected) {
			Result.rejected.push({ name: Refused.op.name, rule: Refused.rule });
			this.Ledger(`refused ${Refused.op.name} (${Refused.rule})`);
		}
		Result.outcome = Result.applied.length > 0 ? "applied" : "proposed";
		Result.report = await this.Record(Input, Result, Route, Digest_, Proposal_, Started);
		this.Ledger(
			`review ${Result.outcome} (${Result.applied.length} applied, ${Result.proposed.length} queued, ${Result.rejected.length} refused)`,
		);
		await this.Save();
		return Result;
	}

	/** The deterministic lifecycle pass; archives move whole directories. */
	async Curate(Now: number = Date.now()): Promise<Curation> {
		switch (true) {
			case !this.Knobs.enabled:
				return { stale: [], archived: [] };
			default:
				break;
		}
		await this.Chain;
		const Curation = Curate(this.Usage.All(), this.Knobs, Now);
		for (const Name of Curation.archived) {
			const Moved = await Apply({ op: "archive", name: Name }, this.Knobs);
			switch (true) {
				case Moved.ok:
					this.Ledger(`archived ${Name} -> ${Moved.path}`);
					break;
				default: {
					// The record says archived but the directory did not move:
					// revert the record so the next pass retries instead of
					// reporting a move that never happened.
					const Entry_ = this.Usage.Get(Name);
					switch (true) {
						case Entry_ === undefined:
							break;
						default:
							this.Usage.Put({ ...Entry_, state: "stale", archivedAt: null });
					}
					this.Ledger(`archive failed for ${Name} (${Moved.error}); kept stale`);
				}
			}
		}
		for (const Name of Curation.stale) {
			this.Ledger(`stale ${Name}`);
		}
		this.Ledger(`curated ${Curation.stale.length} stale, ${Curation.archived.length} archived`);
		await this.Save();
		return Curation;
	}

	/** The corpus-wide counts. */
	Status(): Status {
		const All = this.Usage.All();
		return {
			total: All.length,
			active: All.filter((Entry_) => Entry_.state === "active").length,
			stale: All.filter((Entry_) => Entry_.state === "stale").length,
			archived: All.filter((Entry_) => Entry_.state === "archived").length,
			pinned: All.filter((Entry_) => Entry_.pinned).length,
			pending: this.ReadPending().length,
		};
	}

	/** Pin one entry: no transitions, no review writes. */
	Pin(Name: string): boolean {
		const Entry_ = this.Usage.Get(Name) ?? Fresh(Name, Date.now(), "user");
		Entry_.pinned = true;
		this.Usage.Put(Entry_);
		this.Ledger(`pinned ${Name}`);
		return true;
	}

	/** Unpin one entry. */
	Unpin(Name: string): boolean {
		const Entry_ = this.Usage.Get(Name);
		switch (true) {
			case Entry_ === undefined:
				return false;
			default:
				Entry_.pinned = false;
				this.Usage.Put(Entry_);
				this.Ledger(`unpinned ${Name}`);
				return true;
		}
	}

	/** Move one archived skill back and reactivate its record. */
	async Restore(Name: string): Promise<boolean> {
		const Source = Join(Expand(this.Knobs.archiveRoot), Name);
		const Target = Join(Expand(this.Knobs.skillsRoot), Name);
		try {
			await Rename(Source, Target);
		} catch (Cause) {
			this.Ledger(`restore failed for ${Name} (${(Cause as Error).message})`);
			return false;
		}
		const Entry_ = this.Usage.Get(Name) ?? Fresh(Name, Date.now(), "user");
		Entry_.state = "active";
		Entry_.archivedAt = null;
		Entry_.lastUsedAt = Date.now();
		this.Usage.Put(Entry_);
		this.Ledger(`restored ${Name}`);
		await this.Save();
		return true;
	}

	/** Archive one skill now (the manual pass, no model involved). */
	async Archive(Name: string): Promise<boolean> {
		const Moved = await Apply({ op: "archive", name: Name }, this.Knobs);
		switch (true) {
			case !Moved.ok:
				this.Ledger(`archive failed for ${Name} (${Moved.error})`);
				return false;
			default: {
				const Entry_ = this.Usage.Get(Name) ?? Fresh(Name, Date.now(), "user");
				Entry_.state = "archived";
				Entry_.archivedAt = Date.now();
				this.Usage.Put(Entry_);
				this.Ledger(`archived ${Name} -> ${Moved.path}`);
				await this.Save();
				return true;
			}
		}
	}

	/** The queued proposals, oldest first. */
	Pending(): Queued[] {
		return this.ReadPending();
	}

	/** Land one queued proposal by name (the acceptance seam). */
	async Accept(Name: string): Promise<boolean> {
		const Queue = this.ReadPending();
		const Index = Queue.findIndex((Row) => Row.op.name === Name);
		switch (true) {
			case Index < 0:
				return false;
			default:
				break;
		}
		const [Row] = Queue.splice(Index, 1) as [Queued];
		const Applied = await Apply(Row.op, this.Knobs);
		switch (true) {
			case !Applied.ok:
				this.Ledger(`accept refused ${Name} (${Applied.error})`);
				// Put it back: a refused acceptance is not a decision to drop it.
				await this.WritePending(Queue);
				return false;
			default:
				this.Usage.Touch(Name, "patch", Date.now());
				await this.WritePending(Queue);
				this.Ledger(`accepted ${Row.op.op} ${Name} -> ${Applied.path}`);
				await this.Save();
				return true;
		}
	}

	/** Await the store chain (the smoke seam). */
	async Flush(): Promise<void> {
		await this.Chain;
	}

	/** Persist the usage store on the chain. */
	async Save(): Promise<void> {
		this.Chain = this.Chain.then(async () => {
			try {
				await this.Usage.Save();
			} catch (Cause) {
				this.Ledger(`usage store write failed: ${(Cause as Error).message}`);
			}
		});
		await this.Chain;
	}

	// ------------------------------------------------------------------
	// Internals
	// ------------------------------------------------------------------

	/** The judge's read-only corpus view (the store plus one directory probe). */
	private Corpus(): Corpus {
		const Root = Expand(this.Knobs.skillsRoot);
		return {
			exists: (Name: string): boolean => {
				switch (true) {
					case this.Usage.Get(Name) !== undefined:
						return true;
					default:
						try {
							return existsSync(Join(Root, Name));
						} catch {
							return false;
						}
				}
			},
			pinned: (Name: string): boolean => this.Usage.Get(Name)?.pinned === true,
		};
	}

	/** The review route: the knobs win, then the agent's own options. */
	private Route(Agent: unknown): { provider: string; model: string } | undefined {
		const Options = (Agent as { options?: Record<string, unknown> } | undefined)?.options ?? {};
		const Provider =
			this.Knobs.provider.trim() ||
			(typeof Options["provider"] === "string" ? (Options["provider"] as string) : "");
		const Model =
			this.Knobs.model.trim() ||
			(typeof Options["model"] === "string" ? (Options["model"] as string) : "");
		return Provider === "" || Model === "" ? undefined : { provider: Provider, model: Model };
	}

	/** Queue one operation (one JSON line, appended). */
	private async Enqueue(Op: Op, Now: number): Promise<void> {
		const Row: Queued = { at: Now, op: Op };
		try {
			await Mkdir(Dirname(Expand(this.Knobs.pendingPath)), { recursive: true });
			await Append(Expand(this.Knobs.pendingPath), `${JSON.stringify(Row)}\n`);
			this.Ledger(`queued ${Op.op} ${Op.name}`);
		} catch (Cause) {
			this.Ledger(`queue write failed: ${(Cause as Error).message}`);
		}
	}

	/** Read the pending queue (a malformed line is skipped, never fatal). */
	private ReadPending(): Queued[] {
		let Text: string;
		try {
			Text = readFileSync(Expand(this.Knobs.pendingPath), "utf8");
		} catch {
			return [];
		}
		const Rows: Queued[] = [];
		for (const Raw of Text.split("\n")) {
			const Row = Raw.trim();
			switch (true) {
				case Row === "":
					continue;
				default:
					break;
			}
			try {
				const Value = JSON.parse(Row) as Queued;
				switch (true) {
					case typeof Value?.op?.name !== "string":
						continue;
					default:
						Rows.push(Value);
				}
			} catch {
				continue;
			}
		}
		return Rows;
	}

	/** Rewrite the pending queue (the acceptance path). */
	private async WritePending(Rows: readonly Queued[]): Promise<void> {
		try {
			await Mkdir(Dirname(Expand(this.Knobs.pendingPath)), { recursive: true });
			await WriteFile(
				Expand(this.Knobs.pendingPath),
				Rows.map((Row) => `${JSON.stringify(Row)}\n`).join(""),
			);
		} catch (Cause) {
			this.Ledger(`queue rewrite failed: ${(Cause as Error).message}`);
		}
	}

	/** Write the run report (best-effort). */
	private async Record(
		Input: ReviewInput,
		Result: ReviewResult,
		Route: { provider: string; model: string },
		Digest_: DigestResult,
		Proposal_: Proposal,
		Started: number,
	): Promise<string> {
		const Report_: RunReport = {
			at: new Date().toISOString(),
			session: typeof Input.Session === "string" ? Input.Session : "",
			outcome: Result.outcome,
			provider: Route.provider,
			model: Route.model,
			digest: { kept: Digest_.kept, collapsed: Digest_.collapsed, trimmed: Digest_.trimmed },
			applied: Result.applied,
			proposed: Result.proposed,
			rejected: Result.rejected,
			...(Proposal_.note === undefined ? {} : { note: Proposal_.note }),
			...(Result.detail === undefined ? {} : { detail: Result.detail }),
			durationMs: Date.now() - Started,
		};
		return Report(Expand(this.Knobs.reportsRoot), Report_);
	}

	/** Finish a review that never reached the model (or failed on the way). */
	private async Settle(
		Input: ReviewInput,
		Result: ReviewResult,
		Outcome: ReviewResult["outcome"],
		Detail: string,
		Started: number,
		Route?: { provider: string; model: string },
		Digest_?: DigestResult,
	): Promise<ReviewResult> {
		Result.outcome = Outcome;
		Result.detail = Detail;
		Result.report = await this.Record(
			Input,
			Result,
			Route ?? { provider: "", model: "" },
			Digest_ ?? { text: "", kept: 0, collapsed: 0, trimmed: false },
			{ ops: [] },
			Started,
		);
		this.Ledger(`review ${Result.outcome} (${Detail})`);
		return Result;
	}
}
