import { readFileSync } from "node:fs";

import Outputs from "./Outputs.mjs";

export default (Bytes) => {
	let Stale = false;
	for (const Output of Outputs()) {
		let Current;
		try {
			Current = readFileSync(Output, "utf8");
		} catch {
			console.log(`STALE: ${Output} is missing`);
			Stale = true;
			continue;
		}
		if (Current !== Bytes) {
			console.log(`STALE: ${Output} differs from the generated index`);
			Stale = true;
		}
	}
	return Stale;
};
