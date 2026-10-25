import { execFileSync } from "node:child_process";

import Root from "../../../Common/Function/Root.mjs";

// The pin is the last commit that touched the package's directory, not HEAD:
// a commit that only touches the market index, the docs or the site leaves
// every pin valid, so `--check` stays meaningful between releases. A package
// with no history yet (added but not committed) falls back to HEAD.
const HeadCommit = execFileSync("git", ["rev-parse", "HEAD"], {
	encoding: "utf8",
	cwd: Root,
}).trim();
const HeadTime = Number.parseInt(
	execFileSync("git", ["show", "-s", "--format=%ct", "HEAD"], {
		encoding: "utf8",
		cwd: Root,
	}).trim(),
	10,
);

export default (Path) => {
	const Line = execFileSync("git", ["log", "-1", "--format=%H %ct", "--", Path], {
		encoding: "utf8",
		cwd: Root,
	}).trim();
	const [Commit, Time] = Line === "" ? [HeadCommit, String(HeadTime)] : Line.split(" ");
	return { Commit, Time: Number.parseInt(Time, 10) };
};
