// Policy — the UPDATE-POLICY LOADER mechanics (pure, harness-free): read the
// policy file (a plain fs read — an auxiliary configuration file, part of
// the registry/policy discovery exemption) when given and readable; any
// failure falls back to the module's BUILT-IN DEFAULT with the family's
// byte-identical diagnostic lines (module-prefixed by the module's Append):
//   `update: unreadable policy at <file> — using built-in default`
//   `update: no policy at <file> — using built-in default`
//   `update: using built-in default policy`
// The module supplies its defaults (the engine input — reject lists, dep
// groups, targets, verifyCommand — NEVER install implicitly) and the `Quiet`
// form (used by a module BEFORE its update stage, when it needs a policy
// field to drive the chain pass — the diagnostics belong to the update job).
// The file may be read twice per cycle; both reads are best-effort.
import * as FileSystem from "node:fs";

export default <T>(
	Append: (Message: string) => void,
	File: string,
	Defaults: T,
	Quiet = false,
): T => {
	let Chosen: T | null = null;
	switch (true) {
		case !!File && FileSystem.existsSync(File):
			try {
				Chosen = JSON.parse(FileSystem.readFileSync(File, "utf8")) as T;
			} catch {
				switch (true) {
					case !Quiet:
						Append(`update: unreadable policy at ${File} — using built-in default`);
						break;
				}
			}
			break;
		case !!File && !Quiet:
			Append(`update: no policy at ${File} — using built-in default`);
			break;
	}
	switch (true) {
		case !Chosen:
			switch (true) {
				case !Quiet:
					Append("update: using built-in default policy");
					break;
			}
			return Defaults;
		default:
			return Chosen;
	}
};
