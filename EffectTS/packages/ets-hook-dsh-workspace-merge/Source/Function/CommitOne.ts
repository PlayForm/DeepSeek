// CommitOne - one per-file commit through the factory's WRITE EXECUTOR
// (Function/CommitOne): the explicit replaceIfVersion intent (the waterfall
// skipped), the P4 sandbox fence, the root-context fs/observed emit - the
// factory's own guarded path. After the write the file is read back and
// compared to the intended content: equal -> applied; not equal -> conflict
// (the preview-mismatch arm of the v4.1 conflict rule). A thrown write is
// classified honestly: a sandbox/policy refusal -> denied; a version
// failure -> conflict (with expected/observed); anything else ->
// outcome-unknown, never a guess.
import type { GatedFile } from "@Function/Gate.js";
import type Operation from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

export default async (State: State, Op: Operation, File: GatedFile): Promise<Reply> => {
	try {
		const Outcome = (await State.Factory.Write(State, File.target, Op.content, {
			intent: { kind: "replaceIfVersion", version: Op.version },
			policy: "p4",
			actor: State.Self,
		})) as { version: unknown };
		const Version = String(Outcome.version);
		// The verification read-back: applied bytes must equal the intended
		// content (the preview-match check).
		try {
			const Text = await State.Context.fs.readText(File.target);
			if (Text === Op.content) {
				return { path: Op.path, status: "applied", version: Version };
			}
			return {
				path: Op.path,
				status: "conflict",
				version: Version,
				expected: Op.version,
				observed: Version,
				reason: "the applied bytes differ from the intended content",
			};
		} catch (Cause) {
			return {
				path: Op.path,
				status: "outcome-unknown",
				version: Version,
				reason: `the verification read failed: ${(Cause as Error)?.message ?? String(Cause)}`,
			};
		}
	} catch (Cause) {
		const Message = (Cause as Error)?.message ?? String(Cause);
		// The observed version after the failure decides conflict vs
		// outcome-unknown: an unchanged observed version means the write
		// never landed (a fence/policy refusal); anything else is honest
		// uncertainty.
		let Observed = "absent";
		try {
			const Info = (await State.Context.fs.stat(File.target)) as
				{ version: string } | undefined;
			Observed = Info !== undefined ? String(Info.version) : "absent";
		} catch {
			Observed = "absent";
		}
		switch (true) {
			case /sandbox|policy|permission|denied/i.test(Message):
				return { path: Op.path, status: "denied", expected: Op.version, reason: Message };
			case /version|replaceIfVersion|fence/i.test(Message) || Observed !== Op.version:
				return {
					path: Op.path,
					status: "conflict",
					expected: Op.version,
					observed: Observed,
					reason: Message,
				};
			default:
				return {
					path: Op.path,
					status: "outcome-unknown",
					expected: Op.version,
					observed: Observed,
					reason: Message,
				};
		}
	}
};
