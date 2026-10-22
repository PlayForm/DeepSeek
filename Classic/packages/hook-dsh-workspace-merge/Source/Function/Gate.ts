// Gate - THE ATOMIC GATES (Function/Gate): the preflight that runs before
// ANY write. Every gate failure rejects the whole batch (in all-or-nothing
// mode) or is reported per-file (survivors mode) - the gate never lets a
// partial batch start silently.
//
// The gates, in frozen order:
//   1. empty batch;
//   2. the batch size (maxFiles);
//   3. the batch bytes (maxTotalBytes);
//   4. duplicate paths;
//   5. a missing version fence (the merge never writes unfenced);
//   6. per file: resolve through ctx.fs (unresolved = reject) and stat the
//      observed version (a fence mismatch is a conflict; in
//      all-or-nothing mode any conflict rejects the whole batch).
import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Operation from "@Interface/Operation.js";
import type State from "@Interface/State.js";

export interface GatedFile {
	path: string;
	target: FsTarget;
	expected: string;
	observed: string;
	bytes: number;
	conflict: boolean;
}

export interface GateResult {
	ok: boolean;
	reason?: string;
	files: GatedFile[];
}

export default async (State: State, Operations: Operation[]): Promise<GateResult> => {
	const Reject = (Reason: string): GateResult => ({ ok: false, reason: Reason, files: [] });
	const TotalBytes = Operations.reduce((Sum, Op) => Sum + Op.content.length, 0);
	const Seen = new Set<string>();
	for (const Op of Operations) {
		if (Seen.has(Op.path)) {
			return Reject(`duplicate path ${Op.path}`);
		}
		Seen.add(Op.path);
	}
	switch (true) {
		case Operations.length === 0:
			return Reject("empty batch");
		case Operations.length > State.MaxFiles:
			return Reject(`too many files (${Operations.length} > ${State.MaxFiles})`);
		case TotalBytes > State.MaxTotalBytes:
			return Reject(`too many bytes (${TotalBytes} > ${State.MaxTotalBytes})`);
		case Operations.some((Op) => typeof Op.version !== "string" || Op.version.length === 0):
			return Reject("a version fence is missing");
		default:
	}
	const Files: GatedFile[] = [];
	for (const Op of Operations) {
		let Target: FsTarget;
		try {
			Target = await State.Context.fs.resolve(Op.path);
		} catch (Cause) {
			return Reject(`unresolved ${Op.path} (${(Cause as Error)?.message ?? String(Cause)})`);
		}
		let Observed = "absent";
		try {
			const Info = (await State.Context.fs.stat(Target)) as { version: string } | undefined;
			Observed = Info !== undefined ? String(Info.version) : "absent";
		} catch {
			Observed = "absent";
		}
		if (Observed !== Op.version) {
			Files.push({
				path: Op.path,
				target: Target,
				expected: Op.version,
				observed: Observed,
				bytes: Op.content.length,
				conflict: true,
			});
			switch (State.Mode) {
				case "all-or-nothing":
					return Reject(
						`conflict ${Op.path} (expected ${Op.version}, observed ${Observed})`,
					);
				default:
			}
			continue;
		}
		Files.push({
			path: Op.path,
			target: Target,
			expected: Op.version,
			observed: Observed,
			bytes: Op.content.length,
			conflict: false,
		});
	}
	return { ok: true, files: Files };
};
