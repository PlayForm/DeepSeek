import { existsSync } from "node:fs";
import { join } from "node:path";

import Root from "../../../Common/Function/Root.mjs";

export default () => {
	const Outputs = [join(Root, "marketplace.json")];
	if (existsSync(join(Root, "Site", "Public"))) {
		Outputs.push(join(Root, "Site", "Public", "marketplace.json"));
		return Outputs;
	}
	console.log(
		"Site/Public is absent - writing the root index only (the site tree is a separate repository).",
	);
	return Outputs;
};
