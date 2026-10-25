import { writeFileSync } from "node:fs";

import Outputs from "./Outputs.mjs";

export default (Plugins, Bytes) => {
	const Files = Outputs();
	for (const Output of Files) {
		writeFileSync(Output, Bytes);
	}
	const Versions = Plugins.flatMap((Plugin) => Plugin.versions);
	const NpmVersions = Versions.filter((Version) => Version.source.type === "npm").length;
	const GitVersions = Versions.filter((Version) => Version.source.type === "git").length;
	console.log(
		`Wrote ${Plugins.length} plugins (${NpmVersions} npm versions, ${GitVersions} git versions) to:`,
	);
	for (const Output of Files) {
		console.log(`  ${Output}`);
	}
};
