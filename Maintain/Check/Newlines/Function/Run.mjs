import { readFileSync, statSync, writeFileSync } from "node:fs";

import Problems from "./Problems.mjs";

export default (Files, Fix) => {
	let Violations = 0;
	let Fixed = 0;
	for (const Path of Files) {
		let Content;
		try {
			if (statSync(Path).size === 0) continue;
			Content = readFileSync(Path, "utf8");
		} catch {
			continue;
		}

		const Found = Problems(Content);
		if (Found.length === 0) continue;

		if (Fix && Found.includes("missing final LF")) {
			writeFileSync(Path, Content + "\n");
			Fixed += 1;
			Found.splice(Found.indexOf("missing final LF"), 1);
		}

		if (Found.length > 0) {
			Violations += 1;
			console.log(`${Path}: ${Found.join(", ")}`);
		}
	}
	return { Violations, Fixed };
};
