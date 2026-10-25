import { execFileSync } from "node:child_process";

import Exclude from "./Exclude.mjs";

export default () =>
	execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
		.split("\0")
		.filter(Boolean)
		.filter((Path) => !Exclude(Path));
