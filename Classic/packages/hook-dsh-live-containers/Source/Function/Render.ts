// Render - the substitution engine and the section builder (research section
// 3 + IMPLEMENTATION-DESIGN.md section 3.1, phase 1). {{token}} replace ONLY
// - no eval, no expressions, no `new Function` (research section 5: the
// programmable stage routes evaluation through the ptc-runtime later; v1 has
// no evaluation path at all, provable by grep in the smoke suite). An
// unknown token renders LITERALLY and logs `render unknown <id> <token>` -
// never a failure (the harness's own unresolved-variable failure must never
// be inherited; this section is contributed with interpolate: false, so only
// this engine touches its tokens).
//
// Every enabled block renders inside the FIXED frame so the model cannot
// mistake it for harness state:
//
//   --- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
//   <rendered body>
//   --- END LIVE CONTAINER <id> ---
//
// (the dashes come from config `separator`, default `---`). The section body
// is one frame per rendered block, joined with newlines; when it exceeds
// config `sectionBudgetBytes`, the OLDEST frames collapse to one-line
// summaries - never silently dropped (ledger `failsafe section-collapse <n>`).
//
// Fail-open: a render failure skips the block and logs
// `render failed <id> -> skipped`; the assembly still resolves.
import Clock from "@Function/Clock.js";
import { Table } from "@Function/Counters.js";
import {
	RENDERED_KINDS,
	type AgentState,
	type BlockSpec,
	type Frame as FrameRow,
	type Variables,
} from "@Interface/Execution.js";
import type State from "@Interface/State.js";

/** The ledger sink Apply passes down (Factory.Append with the State bound). */
export type Log = (Message: string) => void;

/** The strict {{token}} grammar: one replace pass, no nesting, no expressions. */
const Token = /\{\{([^{}]+)\}\}/g;

/** The bytes of one string (the ledger's (<len> bytes) values). */
const Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");

/** Substitute {{token}} groups from the variable table. A token the table
 * does not resolve stays literal and logs `render unknown <id> <token>`
 * (once per token per pass). */
export const Substitute = (Template: string, Vars: Variables, ID: string, Append: Log): string => {
	const Unknown = new Set<string>();
	const Text = Template.replace(Token, (Whole, Name: string) => {
		const Key = String(Name);
		const Value = Vars[Key];
		switch (true) {
			case typeof Value === "string":
				return Value;
			default:
				Unknown.add(Key);
				return Whole;
		}
	});
	for (const Name of Unknown) {
		Append(`render unknown ${ID} ${Name}`);
	}
	return Text;
};

/** The fixed frame around one block body (the model-facing contract). */
export const Frame = (Separator: string, ID: string, Body: string): string =>
	`${Separator} LIVE CONTAINER ${ID} (recomputed each request; not harness state) ${Separator}\n${Body}\n${Separator} END LIVE CONTAINER ${ID} ${Separator}`;

/** The one-line summary a collapsed frame leaves behind (never silent). */
const Summary = (Separator: string, ID: string, Length: number): string =>
	`${Separator} LIVE CONTAINER ${ID} (collapsed, ${Length} bytes; not harness state) ${Separator}`;

/** The built-in tokens each kind resolves (phase 1; `template` resolves the
 * whole table). Per-block `vars` override the built-ins. */
const KindTokens: Record<string, readonly string[] | undefined> = {
	time: ["time", "date", "tz"],
	counter: ["messageCount", "turnCount", "sinceLastTool"],
	gauge: ["messageCount", "turnCount", "sinceLastTool"],
	manifest: ["cwd", "sessionId"],
	note: [],
};

/** The per-kind variable view (a VIEW of the shared table - no recompute). */
const View = (Kind: string, Table_: Variables, Own: Record<string, string>): Variables => {
	const Allowed = KindTokens[Kind];
	const Vars: Variables = {};
	switch (true) {
		case Allowed === undefined:
			Object.assign(Vars, Table_);
			break;
		default:
			for (const Name of Allowed) {
				Vars[Name] = Table_[Name] ?? "";
			}
	}
	return { ...Vars, ...Own };
};

/** Render one block to its frame, or null when the kind is not renderable
 * in phase 1 (the wave-2 kinds skip - reason "unknown kind"). */
export const RenderBlock = (
	Agent: State,
	Block: BlockSpec,
	Scope: AgentState,
	At: number,
	Label: string,
	Append: Log,
): string | null => {
	const Text = Substitute(
		Block.template,
		View(Block.kind, Table(Scope, At, Label), Block.vars ?? {}),
		Block.id,
		Append,
	);
	return Frame(Agent.Separator, Block.id, Text);
};

/** Whether the block is stale (needs a re-render) under its trigger and the
 * section refresh policy. */
const Stale = (Agent: State, Block: BlockSpec, Scope: AgentState): boolean => {
	const Cache = Scope.blocks.get(Block.id);
	switch (Block.trigger) {
		case "event":
			return !Cache || Cache.dirty;
		case "ttl":
			return !Cache || Scope.calls - Cache.built >= Block.ttlCalls;
		case "request":
			switch (Agent.Refresh) {
				case "ttl":
					return !Cache || Scope.calls - Cache.built >= Agent.TtlCalls;
				default:
					return true;
			}
		default:
			return false;
	}
};

/** The skip decision outside the render path (config-shaped, not state).
 * Only the phase-1 kinds render; the wave-2 kinds skip until C2's engine. */
const SkipReason = (Block: BlockSpec): string | null => {
	switch (true) {
		case !(RENDERED_KINDS as readonly string[]).includes(Block.kind):
			return "unknown kind";
		case Block.scope !== "always":
			return "scope";
		case Block.trigger === "manual":
			return "manual";
		default:
			return null;
	}
};

/** One skip, logged only when the reason changes (the ledger stays quiet on
 * steady state). */
const Skip = (Scope: AgentState, ID: string, Reason: string, Append: Log): void => {
	const Previous = Scope.skips.get(ID);
	switch (Previous) {
		case Reason:
			break;
		default:
			Scope.skips.set(ID, Reason);
			Append(`block skipped ${ID} (${Reason})`);
	}
};

/** Build the section body for one assembly (research section 3: "the
 * system-prompt/assemble 'live section'"). Returns the body text, or ""
 * when nothing renders (Apply then appends NO section at all). */
export default (Agent: State, Scope: AgentState, Label: string, Append: Log): string => {
	const At = Clock(Agent);
	const Frames: (FrameRow | null)[] = [];
	for (const Block of Agent.Blocks ?? []) {
		try {
			const Reason = SkipReason(Block);
			if (Reason !== null) {
				Skip(Scope, Block.id, Reason, Append);
				Frames.push(null);
				continue;
			}
			if (!Block.enabled) {
				Skip(Scope, Block.id, "disabled", Append);
				Frames.push(null);
				continue;
			}
			const Cache = Scope.blocks.get(Block.id);
			switch (Stale(Agent, Block, Scope)) {
				case true:
					break;
				default: {
					// Cache hit: reuse the built frame (no ledger line - steady
					// state is quiet, the tool-coach discipline).
					Frames.push({
						id: Block.id,
						text: Cache?.text ?? "",
						length: Bytes(Cache?.text ?? ""),
					});
					continue;
				}
			}
			const Text = RenderBlock(Agent, Block, Scope, At, Label, Append);
			if (Text === null) {
				Skip(Scope, Block.id, "unknown kind", Append);
				Frames.push(null);
				continue;
			}
			Scope.skips.delete(Block.id);
			Scope.blocks.set(Block.id, { built: Scope.calls, text: Text, dirty: false });
			Frames.push({ id: Block.id, text: Text, length: Bytes(Text) });
			Append(`block rendered ${Block.id} (${Bytes(Text)} bytes)`);
		} catch (Error) {
			// Fail-open: a broken block skips; the assembly still resolves.
			Frames.push(null);
			try {
				const ID = Block.id;
				try {
					Scope.blocks.set(ID, { built: Scope.calls, text: "", dirty: false });
				} catch {
					/* the cache is best-effort */
				}
				Append(`render failed ${ID} -> skipped`);
			} catch {
				/* even the block id threw - the listener's warn records it */
			}
			void Error;
		}
	}
	const Present = Frames.filter((Frame_): Frame_ is FrameRow => Frame_ !== null);
	const Body = (): string => Present.map((Frame_) => Frame_.text).join("\n");
	if (Present.length === 0) {
		return "";
	}
	// The budget pass: when the body exceeds the budget, the OLDEST frames
	// collapse to one-line summaries (never silently dropped). The last frame
	// is never collapsed (there must remain something to read).
	if (Agent.Budget > 0 && Bytes(Body()) > Agent.Budget && Present.length > 1) {
		const Texts = Present.map((Frame_) => Frame_.text);
		let Count = 0;
		while (Count < Present.length - 1 && Bytes(Texts.join("\n")) > Agent.Budget) {
			const Oldest = Present[Count];
			if (!Oldest) {
				break;
			}
			Texts[Count] = Summary(Agent.Separator, Oldest.id, Oldest.length);
			Count += 1;
		}
		if (Count > 0) {
			Append(`failsafe section-collapse ${Count}`);
		}
		const Collapsed = Texts.join("\n");
		return Collapsed;
	}
	const Text = Body();
	// The global TTL (refresh "ttl"): the whole body is cached and rebuilt
	// every ttlCalls assemblies (the tool-coach's sectionTtl pattern); the
	// per-block staleness above decides which frames actually re-render on a
	// rebuild. refresh "request" re-renders per assembly and keeps no global
	// cache.
	switch (Agent.Refresh) {
		case "ttl": {
			const Rebuilt = Scope.sectionCache !== undefined;
			Scope.sectionCache = { built: Scope.calls, text: Text };
			if (Rebuilt) {
				Append(`section rebuilt (ttl ${Agent.TtlCalls})`);
			}
			return Text;
		}
		default:
			return Text;
	}
};

/** The fresh-check the assemble listener runs BEFORE building (the global
 * cache hit: nothing is dirty, the TTL has not expired - return the cached
 * body unchanged, no ledger line). */
export const Cached = (Agent: State, Scope: AgentState): string | null => {
	switch (Agent.Refresh) {
		case "ttl":
			break;
		default:
			return null;
	}
	const Cache = Scope.sectionCache;
	switch (true) {
		case !Cache || Scope.calls - Cache.built >= Agent.TtlCalls:
			return null;
		default: {
			for (const Block of Agent.Blocks ?? []) {
				if (SkipReason(Block) !== null || !Block.enabled) {
					continue;
				}
				if (Stale(Agent, Block, Scope)) {
					return null;
				}
			}
			// The hit re-renders nothing and logs nothing - steady state is
			// quiet (the assembly count was advanced by the listener).
			return Cache.text;
		}
	}
};
