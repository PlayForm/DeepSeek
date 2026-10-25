import { existsSync } from "node:fs";
import { join } from "node:path";

import Root from "../../../Common/Function/Root.mjs";

// The icon field carries the colour render as a relative reference (the format-1
// validator resolves it against the index URL to the same origin). It is added
// ONLY when the asset exists, so a tree without generated icons keeps the
// committed index byte-identical and `--check` stays green.
export default (Directory) =>
	existsSync(join(Root, "Site", "Public", "Icons", "Color", `${Directory}.svg`))
		? `Icons/Color/${Directory}.svg`
		: null;
