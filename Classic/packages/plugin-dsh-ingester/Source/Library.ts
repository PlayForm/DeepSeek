// Library - the entry module of the INGESTER (@playform/plugin-dsh-ingester,
// ctx.ingester), the apply direction of the batch flow
// (Documentation/Plans/PASS-ON-AND-INGER.md section 4). Class form (the
// factory's precedent): `export default class Ingester extends Service` with
// `super(Context, "ingester")`, registered immediately on construction and
// removed with its owning fiber.
//
// THE SERVICE SURFACE (ctx.ingester):
//
//   Apply(proposal, decision) - the version-fenced apply: per target, in
//                               the proposal's order, through the governed
//                               filesystem. Returns the honest BatchResult.
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

import ApplyFn from "./Function/Apply.js";
import type Config from "./Interface/Config.js";
import type Decision from "./Interface/Decision.js";
import type Proposal from "./Interface/Proposal.js";
import type Result from "./Interface/Result.js";
import type State from "./Interface/State.js";
import Definition from "./Variable/Config.js";

export default class Ingester extends Service {
	static inject = ["fs"];

	static Config = Definition;

	private State: State;

	constructor(Context: Context, Config: Config) {
		super(Context, "ingester");
		const Ledger = Config.logFile.startsWith("~")
			? `${Home()}${Config.logFile.slice(1)}`
			: Config.logFile;
		this.State = {
			Config,
			Context,
			Module: "plugin-dsh-ingester",
			Ledger,
			Enabled: Config.enabled,
			Fs: (Context as { fs?: FileSystem }).fs,
		};
	}

	/** Apply an approved proposal, per target, in order, version-fenced
	 *  (the honest BatchResult; a conflict never silently overwrites). */
	Apply(Proposal: Proposal, Decision: Decision): Promise<Result> {
		return ApplyFn(this.State, Proposal, Decision);
	}
}
