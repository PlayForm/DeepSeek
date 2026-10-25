// The expected PASS count a per-test folder's README declares.
//
// The count is the vacuously-green guard: a suite that exits zero while
// exercising fewer checks than its README promises is still a failure, so the
// runner must know the promise before it trusts the exit code.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export default (Directory, Label) => {
	const Text = readFileSync(join(Directory, "README.md"), "utf8");
	const Index = Text.indexOf("## Expected count");
	if (Index < 0) {
		throw new Error(`${Label}: README has no "## Expected count"`);
	}
	const Match = /(\d+)\s*PASS/.exec(Text.slice(Index));
	if (!Match) {
		throw new Error(`${Label}: README has no "<N> PASS." count`);
	}
	return Number(Match[1]);
};
