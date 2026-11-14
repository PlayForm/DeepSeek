import { writeFileSync } from "node:fs";

import Outputs from "./Outputs.mjs";

export default (Tools, Bytes, Source) => {
	const Files = Outputs();
	for (const Output of Files) {
		writeFileSync(Output, Bytes);
	}
	const Parameters = Tools.reduce(
		(Total, Tool) => Total + Object.keys(Tool.parameters.properties).length,
		0,
	);
	console.log(`Read ${Source}`);
	console.log(`Wrote ${Tools.length} tools (${Parameters} parameters) to:`);
	for (const Output of Files) {
		console.log(`  ${Output}`);
	}
};
