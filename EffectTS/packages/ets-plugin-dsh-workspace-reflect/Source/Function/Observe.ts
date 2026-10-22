// Observe - the pre-operation read (Function/Observe): resolve the path
// through ctx.fs, stat it, read its text, and hand the caller the exact
// pieces every reflective op needs: the resolved target (for the guarded
// write), the observed version (the fence basis), the text lines, and the
// size guard. A missing file or an oversized file is a `rejected` reply,
// never a fabricated empty read.
import type { Context } from "@deepseek-ai/cordis";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

interface Observed {
	target: unknown;
	version: string;
	lines: string[];
}

export default async (
	State: State,
	Path: string,
): Promise<{ Ok: true; Observed: Observed } | { Ok: false; Reply: Reply }> => {
	const Target = await (State.Context as Context).fs.resolve(Path);
	const Info = (await (State.Context as Context).fs.stat(Target)) as
		{ version: string; type: string; size?: number } | undefined;
	if (Info === undefined || Info.type !== "file") {
		return {
			Ok: false,
			Reply: {
				status: "rejected",
				detail: "not an observed file",
				version: undefined,
			},
		};
	}
	if (typeof Info.size === "number" && State.MaxFileBytes > 0 && Info.size > State.MaxFileBytes) {
		return {
			Ok: false,
			Reply: {
				status: "rejected",
				detail: "file too large",
				version: undefined,
			},
		};
	}
	const Text = await (State.Context as Context).fs.readText(Target);
	return {
		Ok: true,
		Observed: {
			target: Target,
			version: String(Info.version),
			lines: Text.split("\n"),
		},
	};
};
