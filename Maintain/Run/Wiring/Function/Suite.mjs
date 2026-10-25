import FileSystem from "node:fs";
import Path from "node:path";

import Expected from "../../../Common/Function/Expected.mjs";
import Stream from "../../../Common/Function/Stream.mjs";

// The expected PASS count, declared by the folder's README (`## Expected
// count` -> `<N> PASS.`). A folder without a parseable count is a failure -
// the count IS the vacuously-green guard.
export default async (Tree, Suite, Scratch) => {
	const Directory = Path.join(Tree, "smokes", Suite);
	const File = Path.join(Directory, "Test.mjs");
	console.log(`\n=== ${Tree}/${Suite}`);
	if (!FileSystem.existsSync(File)) {
		console.error(
			`\nFAILED: ${Tree}/${Suite} - ${File} is missing (run sh ${Tree}/smokes/Build-Tests.sh first)`,
		);
		return null;
	}
	const { Code, Printed } = await Stream(File, { ...process.env, DSH_TEST_SCRATCH: Scratch });
	let Want;
	try {
		Want = Expected(Directory, Directory);
	} catch (Error) {
		console.error(String(Error));
		return null;
	}
	switch (true) {
		case Code !== 0:
			console.error(`\nFAILED: ${Tree}/${Suite} (exit ${Code})`);
			return null;
		case Printed === null:
			console.error(`\nFAILED: ${Tree}/${Suite} printed no "N PASS - <Name>" line`);
			return null;
		case Printed !== Want:
			console.error(
				`\nFAILED: ${Tree}/${Suite} printed ${Printed} PASS, README expects ${Want} (the vacuously-green guard)`,
			);
			return null;
	}
	return Printed;
};
