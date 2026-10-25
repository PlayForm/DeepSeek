import FileSystem from "node:fs";
import Path from "node:path";

// The per-test folders: every package that carries a Target/Test/ tree.
export default () => {
	const Packages = [
		...FileSystem.readdirSync("Classic/packages", { withFileTypes: true })
			.filter((Entry) => Entry.isDirectory())
			.map((Entry) => Path.join("Classic/packages", Entry.name)),
		...FileSystem.readdirSync("EffectTS/packages", { withFileTypes: true })
			.filter((Entry) => Entry.isDirectory())
			.map((Entry) => Path.join("EffectTS/packages", Entry.name)),
	];

	const Folders = [];
	for (const Package of Packages) {
		const Test = Path.join(Package, "Target/Test");
		if (!FileSystem.existsSync(Test)) {
			continue;
		}
		for (const Entry of FileSystem.readdirSync(Test, { withFileTypes: true })) {
			if (!Entry.isDirectory()) {
				continue;
			}
			const File = Path.join(Test, Entry.name, "Test.js");
			if (FileSystem.existsSync(File)) {
				Folders.push({ Name: Entry.name, Package, File });
			}
		}
	}
	Folders.sort((Left, Right) => Left.File.localeCompare(Right.File));
	return Folders;
};
