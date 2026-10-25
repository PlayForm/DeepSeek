import * as FS from "node:fs";
import * as Path from "node:path";

/** Write the expected twin text into the ETS tree. */
export default (To, Expected) => {
	let Generated = 0;
	for (const [File, Text] of Expected) {
		const Target = Path.join(To, File);
		FS.mkdirSync(Path.dirname(Target), { recursive: true });
		FS.writeFileSync(Target, Text);
		Generated += 1;
	}
	return Generated;
};
