import Path from "node:path";

import Expected from "../../../Common/Function/Expected.mjs";
import Stream from "../../../Common/Function/Stream.mjs";

// The expected PASS count, declared by the folder's SOURCE README
// (`Source/Test/<Name>/README.md`, section "## Expected count" ->
// "<N> PASS."). A folder without a parseable count is a failure - the count
// IS the vacuously-green guard. (The README stays in Source/Test; the build
// compiles only the Test.ts files into Target/Test.)
export default async (Folders) => {
	for (const Folder of Folders) {
		console.log(`\n=== ${Folder.Package} / ${Folder.Name}`);
		const { Code, Printed } = await Stream(Folder.File);
		let Want;
		try {
			Want = Expected(
				Path.join(Folder.Package, "Source/Test", Path.basename(Path.dirname(Folder.File))),
				`${Folder.Package}/${Folder.Name}`,
			);
		} catch (Error) {
			console.error(String(Error));
			return 1;
		}
		switch (true) {
			case Code !== 0:
				console.error(`\nFAILED: ${Folder.Package} / ${Folder.Name} (exit ${Code})`);
				return Code;
			case Printed === null:
				console.error(
					`\nFAILED: ${Folder.Package} / ${Folder.Name} printed no "N PASS - <Name>" line`,
				);
				return 1;
			case Printed !== Want:
				console.error(
					`\nFAILED: ${Folder.Package} / ${Folder.Name} printed ${Printed} PASS, README expects ${Want} (the vacuously-green guard)`,
				);
				return 1;
		}
	}
	return 0;
};
