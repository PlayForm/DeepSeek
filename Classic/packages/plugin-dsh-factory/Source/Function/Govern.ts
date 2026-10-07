// Govern - the direct-govern entry (Function/Govern in the service API, the
// factory's raw-write companion): the registered steps for the target's
// basename, filtered by the caller's selection and run in REGISTERED order,
// each step CONTAINED (a try/catch per step - the family's silence invariant:
// never throws, never affects the caller, so a failing step can never turn a
// successful write into a tool error).
//
// THE SEQUENTIAL FOLD (v0.2.1): the steps are AWAITED, one at a time —
// `for (const Step of Listed) { await Step.run(...) }`. Each step's chain
// completes (its guarded write + its ledger line) BEFORE the next step reads
// the file, so the compositional loop is deterministic: with several steps
// registered for one basename (e.g. the governor's canonicalize + update),
// the later step always reads the file as the earlier step left it, and the
// version-guarded `replaceIfVersion` writes can never race each other (the
// pre-fold detached/concurrent version let the chains race — the first write
// won, later ones failed FS_STALE_VERSION, and the file's final state plus
// the ledger lines were nondeterministic). The async signature is why the
// raw-write exec awaits the Govern call: the tool's result returns AFTER the
// fold completes.
//
// The registry is the SharedJournal pattern at the instance level: the
// governance modules register their steps at apply time
// (`RegisterGovern(basename, name, run)` - Library.ts), and each run closure
// captures its own State, so every ledger string stays the MODULE'S OWN,
// byte-identical (the factory never owns ledger strings). One basename maps
// to one ordered step list; unknown steps in a selection match nothing and
// are ignored by construction.
//
// Selection semantics (the per-call `govern` flag the raw-write tool passes):
//   * `true` or `"all"`   - every registered step for the basename;
//   * an array of names (or a single name) - ONLY the named steps, in the
//     registered order;
//   * `false`, `null` or absent - no governance at all (the escape hatch;
//     the raw-write tool omits the Govern call entirely for these).
import { basename as Base } from "node:path";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

/** One registered step: the module's name plus its run closure. The closure
 *  captures the module's own State (built in that module's apply), so the
 *  chain pass, the update stage and every ledger line stay module-owned. The
 *  run may return a promise (the sequential fold awaits it — the step's
 *  chain completes before the next step starts) or nothing (a synchronous
 *  step). */
export interface Step {
	name: string;
	run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}

/** The registry: basename → the registered steps in registration order. */
export type Registry = { [basename: string]: Step[] };

/** The selection: `true`/`"all"` = every registered step; an array (or a
 *  single name) = only the named steps; `false`/`null`/absent = none. */
export type Selection = boolean | string | string[] | null | undefined;

export default async (
	Steps: Registry,
	Target: FsTarget,
	Select: Selection,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> => {
	// The registered steps for the target's basename (none for a basename no
	// module claimed - the factory's registry is empty in the raw-write smoke's
	// posture, and `govern` is a contained no-op there).
	const Listed = Steps[Base(Target.displayPath)] ?? [];
	// Resolve the selection to the set of step names to run; `null` means "all
	// registered steps" (the filter below lets everything through).
	let Chosen: Set<string> | null;
	switch (true) {
		case Select === true || Select === "all":
			Chosen = null; // every registered step
			break;
		case Array.isArray(Select):
			Chosen = new Set(Select as string[]);
			break;
		case typeof Select === "string" && Select.length > 0:
			Chosen = new Set([Select as string]);
			break;
		default:
			return; // false / null / absent - the designed no-op
	}
	// Registered order, one contained try/catch per step, AWAITED one at a
	// time (the sequential fold): a throwing run never propagates, and each
	// step's chain — its guarded write and its ledger line — completes before
	// the next step reads the file.
	for (const Step of Listed) {
		switch (true) {
			case Chosen !== null && !Chosen.has(Step.name):
				continue; // not selected (unknown names simply match nothing)
		}
		try {
			await Step.run(Target, Actor, Version);
		} catch {
			/* contained - the family's silence invariant */
		}
	}
};
