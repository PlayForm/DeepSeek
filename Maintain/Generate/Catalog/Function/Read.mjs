import { readFileSync } from "node:fs";
import { join } from "node:path";

import Root from "../../../Common/Function/Root.mjs";

// The harness's own generated tool catalog, read from the pinned submodule.
//
// The harness boots every shipped tool plugin on a real context and writes the
// name, description and JSON-Schema parameters each one registers; its CI
// re-derives the file and fails when it is stale (`verify-tool-catalog`). A
// pinned submodule commit is therefore a trustworthy, reviewable snapshot of
// the tool contract, and reading it here needs no harness installation and no
// plugin boot.
const Source = join(Root, "Module", "deepseek-harness", "docs", "tool-catalog.md");

export default (Override) => {
	const Path = Override ?? Source;
	try {
		return { path: Path, text: readFileSync(Path, "utf8") };
	} catch {
		throw new Error(
			`catalog: cannot read ${Path}. Clone the harness submodule (git submodule update --init Module/deepseek-harness) or pass --source <path-to-tool-catalog.md>.`,
		);
	}
};
