// Library - the entry module of the INGESTER (@playform/plugin-dsh-ingester,
// ctx.ingester), the apply direction of the batch flow
// (Documentation/Plans/PASS-ON-AND-INGESTER.md section 4). Class form (the
// factory's precedent): `export default class Ingester extends Service` with
// `super(Context, "ingester")`, registered immediately on construction and
// removed with its owning fiber.
//
// THE SERVICE SURFACE (ctx.ingester):
//
//   Apply(proposal, decision) - the version-fenced apply: per target, in
//                               the proposal's order, through the governed
//                               filesystem. Returns the honest BatchResult.
//                               One apply per proposal (the claim in
//                               Function/Claim).
//   WhenIdle()                - await every in-flight apply (the flush seam
//                               the smokes use instead of sleeping).
//
// THE EVENT PATH (the plan's deferred trace adapter, now wired): the
// constructor registers two bus listeners (Function/Listen) - `batch/proposed`
// records the proposal, `batch/decision` consumes the decision and applies it
// through the same content fence. An approved batch therefore applies with
// no caller wiring at all, and the tool handoff path (the decision hook's
// `Apply`) shares the same one-apply claim.
//
// THE ONLY-WRITER LAW: the ingester is the batch's write path - the pass-on
// and the decision must never write. Writes go through ctx.fs (the governed
// write path: editText with the version guard, so a stale content is
// FS_STALE_VERSION, not a silent overwrite). The journal is written before
// and after; the ledger line per target.
//
// inject: ["fs"] - the governed filesystem service is the write path; the
// plugin registers NO fs/observed listener and never reads policy files.
import { homedir as Home } from "node:os";

import { Service, type Context } from "@deepseek-ai/cordis";
import type FileSystem from "@deepseek-ai/dsh-fs";
import type { Allowlist } from "@playform/plugin-dsh-factory";

import ClaimFn from "./Function/Claim.js";
import ListenFn from "./Function/Listen.js";
import type Config from "./Interface/Config.js";
import type Decision from "./Interface/Decision.js";
import type Proposal from "./Interface/Proposal.js";
import type Result from "./Interface/Result.js";
import type State from "./Interface/State.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export default class Ingester extends Service {
	static inject = ["fs"];

	static Config = Definition;

	private State: State;

	constructor(Context: Context, Config: Config) {
		super(Context, "ingester");
		const Ledger = Config.logFile.startsWith("~")
			? `${Home()}${Config.logFile.slice(1)}`
			: Config.logFile;
		// THE POLICY BLOCK (D6) is a VOLATILE cell in the schema (the factory's
		// shared block); the class form has no factory State builder to unwrap
		// it, so the block is normalized ONCE here - a config edit reloads the
		// plugin anyway (the class form's documented posture).
		const Allow: Allowlist =
			(Config.policy as unknown as { get?: () => Allowlist }).get?.() ?? Config.policy;
		this.State = {
			Config: { ...Config, policy: Allow },
			Context,
			Module: "plugin-dsh-ingester",
			Ledger,
			Enabled: Config.enabled,
			Fs: (Context as { fs?: FileSystem }).fs,
			Proposals: new Map(),
			Pending: new Map(),
		};
		// The trace adapter: the decision event is the apply trigger.
		ListenFn(this.State);
	}

	/** Apply an approved proposal, per target, in order, version-fenced
	 *  (the honest BatchResult; a conflict never silently overwrites; one
	 *  apply per proposal however many callers ask). */
	Apply(Proposal: Proposal, Decision: Decision): Promise<Result | null> {
		return ClaimFn(this.State, Proposal, Decision);
	}

	/** Await every in-flight apply (the flush seam: no sleeps in the smokes,
	 *  no timers in the hot path). */
	async WhenIdle(): Promise<void> {
		await Promise.allSettled([...this.State.Pending.values()]);
	}

	/** The recorded proposals (the decision consumer's read). */
	Proposals(): Proposal[] {
		return [...this.State.Proposals.values()];
	}
}

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's names are unchanged
// (the class form's default export with static inject/Config), and Version
// is a standalone named export, not on the class.
export { Version };
