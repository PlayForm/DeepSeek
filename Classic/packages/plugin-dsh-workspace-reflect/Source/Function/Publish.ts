// Publish - the shared write+reply path (Function/Publish): the ONLY way a
// reflective operation touches the filesystem. Given a path, the version
// observed just before the transformation, and the new content:
//
//   1. resolve the path through ctx.fs (cwd = the session working
//      directory);
//   2. publish through the factory's GuardedWrite - the explicit
//      replaceIfVersion intent (the version fence), the P4 sandbox policy,
//      the stash pre-registration;
//   3. map the outcome to the reply union:
//        - a successful write -> `applied`, carrying the new version;
//        - a stale-version failure -> `conflict` (the fence did its job;
//          the file moved under the operation, nothing was overwritten);
//        - any other failure -> `outcome-unknown` (honest: the write
//          neither succeeded nor is known to have failed cleanly);
//      a caller that cannot confirm the outcome at all maps to
//      `recovery-required` before this module is ever entered - the split
//      between the two keeps each reply's meaning exact.
//
// Every publish is logged by the CALLER (each op composes its own ledger
// line from the reply), so this module logs nothing.
import type { Context } from "@deepseek-ai/cordis";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

export default async (
	State: State,
	Path: string,
	Version: string,
	Content: string,
): Promise<Reply> => {
	try {
		const Target = await (State.Context as Context).fs.resolve(Path);
		const Outcome = await State.Factory.GuardedWrite(State, Target, Content, Version);
		return {
			status: "applied",
			detail: Outcome.operation,
			version: Outcome.version,
		};
	} catch (Cause) {
		const Message = Cause instanceof Error ? Cause.message : String(Cause);
		const Stale = /stale|version/i.test(Message);
		return Stale
			? {
					status: "conflict",
					detail: Message,
					version: undefined,
				}
			: {
					status: "outcome-unknown",
					detail: Message,
					version: undefined,
				};
	}
};
