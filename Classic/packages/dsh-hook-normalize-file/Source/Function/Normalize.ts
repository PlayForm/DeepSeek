// Normalize - the read → count → write pipeline, the file-content
// normalizer's ONE execution path (the tool's exec calls exactly this): read
// the target's content, apply the family's SIX transforms with a per-character
// count, and write ONLY when something changed. The inversion of the file-hook
// trigger is the design: everything happens inside one explicit agent tool
// call - there is NO event listener behind it (the family's first
// listener-less flavor), so this function is the whole behavior.
//
// The pipeline, stage by stage:
//
//   1. READ      - `State.Context.fs.readText(Target, signal)` - the shared
//                  read path; a missing file, a directory, a binary or
//                  undecodable target, a permission failure or an abort all
//                  reject here and are re-thrown with the tool's context
//                  prefix (`normalize-file: cannot read <path>: ...`), so the
//                  registry turns the failure into an error result - NO
//                  write, NO ledger line, NO journal record (the mime
//                  check, tool-shaped: the backend owns binary rejection, the
//                  pipeline never sees undecodable bytes).
//   2. COUNT     - the six-fold chain (the raw-write `normalize: true`
//                  order), daisy-chaining the text and SUMMING the counts -
//                  the core's `{ text, count }` contract on every step:
//                    1. Dashes    class → the configured `replacement`
//                    2. Quotes    MAP    → curly → straight
//                    3. Ellipsis  class  → "..."
//                    4. Spaces    class  → " "
//                    5. Invisible class  → "" (removed)
//                    6. Fullwidth MAP    → full-width → half-width
//                  The tables and replacers are the core's (@playform/
//                  hook-dsh-core, imported directly - the same source the six
//                  stream flavors delegate to). The chain is PURE: the core's
//                  replacers are pure and total on any string, and the
//                  per-call regex construction carries no lastIndex state.
//   3. CONDITION - N = 0 → NO write at all (the design's no-op no-write
//                  rule): the file is left byte-identical, no ledger line, no
//                  journal record; the result simply reports `changed: false`.
//                  N > 0 → the write goes through the factory's ONE shared
//                  write executor (`State.Factory.Write` - factory SCHEME.md
//                  §2.7), which owns everything after the resolve-side read:
//                  the fs/write-intent waterfall (the observation policy's
//                  single-slot guarded-write decision, with `next()`
//                  delegating to the unconditional default), the standing
//                  sandbox policy (the built-in write's no-escalation
//                  replica), `writeText` end to end (signal honored), and the
//                  `fs/observed { kind: "present", version }` emit ON THE
//                  ROOT CONTEXT with the call's exec as the actor - the
//                  governance trio's Gate requires the actor tool name to be
//                  in their `mutationTools` pin, which `normalize-file` never
//                  joins (the design's rule: never add it to any list), so
//                  these writes never trigger a chain pass.
//   4. LEDGER    - the count line `normalized N char(s) in <path>` (via
//                  `State.Factory.Append` - logger + durable file, never
//                  throws) and the P5 journal record (the `normalized` event
//                  of the shared package_governance v2 domain, with the
//                  target's displayPath as the path), N > 0 only.
//
// Pure module: no module-level state (two concurrent calls share nothing -
// every value is a local), so HMR reloads and parallel calls cannot
// interfere.
import {
	Replace,
	ReplaceMap,
	Dashes,
	Quotes,
	Ellipsis,
	Spaces,
	Invisible,
	Fullwidth,
} from "@playform/hook-dsh-core";
import type State from "@Interface/State.js";

/** The target type is the shared write executor's own second parameter. */
type Target = Parameters<State["Factory"]["Write"]>[1];

/** What the tool's exec returns (the tool's output schema shape). */
export interface Outcome {
	/** The target's display path (model/UI-facing). */
	path: string;
	/** Replaced character count across all six transforms. */
	count: number;
	/** Whether a write happened (N > 0). */
	changed: boolean;
	/** The file's content BEFORE the write (only when changed). */
	before?: string | null;
	/** The file's content AFTER the write (only when changed). */
	after?: string;
}

// The COUNTING six-fold chain: the raw-write tool's Rewrite order, but
// keeping the counts (the core's `{ text, count }` contract, summed) - the
// count is the ledger line's N and the no-op condition.
const Rewrite = (Content: string, Replacement: string): { text: string; count: number } => {
	let Text = Content;
	let Count = 0;
	const DashesStep = Replace(Text, Dashes, Replacement);
	Text = DashesStep.text;
	Count += DashesStep.count;
	const QuotesStep = ReplaceMap(Text, Quotes);
	Text = QuotesStep.text;
	Count += QuotesStep.count;
	const EllipsisStep = Replace(Text, Ellipsis, "...");
	Text = EllipsisStep.text;
	Count += EllipsisStep.count;
	const SpacesStep = Replace(Text, Spaces, " ");
	Text = SpacesStep.text;
	Count += SpacesStep.count;
	const InvisibleStep = Replace(Text, Invisible, "");
	Text = InvisibleStep.text;
	Count += InvisibleStep.count;
	const FullwidthStep = ReplaceMap(Text, Fullwidth);
	Text = FullwidthStep.text;
	Count += FullwidthStep.count;
	return { text: Text, count: Count };
};

export default async (
	State: State,
	Target: Target,
	Exec: { signal?: AbortSignal | undefined },
): Promise<Outcome> => {
	// Stage 1 - READ. Failures (missing file, directory, binary/undecodable,
	// permissions, abort) are re-thrown with the tool's context prefix; the
	// registry turns the throw into an error result - nothing is written.
	let Content: string;
	try {
		Content = await State.Context.fs.readText(Target, Exec.signal);
	} catch (Error_) {
		throw new Error(
			`normalize-file: cannot read ${Target.displayPath}: ${(Error_ as Error).message}`,
		);
	}
	// Stage 2 - COUNT (the six-fold chain, counts summed).
	const Rewritten = Rewrite(Content, State.Replacement);
	// Stage 3 - CONDITION: N = 0 → NO write at all.
	if (Rewritten.count === 0) {
		return { path: Target.displayPath, count: 0, changed: false };
	}
	const Outcome = await State.Factory.Write(State, Target, Rewritten.text, {
		signal: Exec.signal,
		actor: Exec,
		policy: "standing",
	});
	// Stage 4 - LEDGER (N > 0 only): the count line and the P5 journal record
	// (event `normalized`, path = the target's displayPath, detail =
	// byte-identical to the ledger line).
	const Line = `normalized ${Rewritten.count} char(s) in ${Target.displayPath}`;
	State.Factory.Append(State, Line);
	State.Factory.Journal(State, "normalized", Target.displayPath, Line);
	return {
		path: Target.displayPath,
		count: Rewritten.count,
		changed: true,
		before: Outcome.before,
		after: Outcome.after,
	};
};
