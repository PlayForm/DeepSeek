import * as FS from "node:fs";
import * as Path from "node:path";

import Excluded from "../Variable/Exclusions.mjs";
import Files from "../Variable/Files.mjs";
import Patches from "../Variable/Patches.mjs";
import Check from "./Check.mjs";
import Expect from "./Expect.mjs";
import Mirror from "./Mirror.mjs";
import Patch from "./Patch.mjs";
import Protect from "./Protect.mjs";
import Walk from "./Walk.mjs";

/** One twin: mirror the Classic package into the ETS tree, or compare the two
 *  under --check. Returns the per-twin counters and failures. */
export default (Twin, CheckOnly) => {
	const TwinName = Twin.name.replace("@playform/", "");
	const ClassicName = TwinName.replace(/^ets-/, "");
	const From = Path.join("Classic/packages", ClassicName);
	const To = Path.join("EffectTS/packages", TwinName);

	if (!FS.existsSync(From)) {
		return {
			Generated: 0,
			Skipped: 0,
			Protected: 0,
			Patched: 0,
			Stale: [],
			Missing: [`${Twin.name} <- ${From}`],
		};
	}

	const Paths = [
		...Files.filter((File) => FS.existsSync(Path.join(From, File))),
		...Walk(From, "Configuration"),
		...Walk(From, "Source"),
	];

	const Exclusion = Excluded.get(TwinName) ?? new Set();

	// The expected twin: the substituted Classic text, then the patch table
	// applied IN MEMORY (so --check compares the same bytes the write emits).
	const { Expected, Skipped } = Expect(From, Paths, Exclusion);
	const Patched = Patch(
		Expected,
		Patches.filter((Entry) => Entry.Twin === TwinName),
		TwinName,
	);
	const Protected = Protect(Exclusion, To, TwinName);
	const Stale = CheckOnly ? Check(To, Expected, Exclusion, TwinName) : [];
	const Generated = CheckOnly ? 0 : Mirror(To, Expected);

	return { Generated, Skipped, Protected, Patched, Stale, Missing: [] };
};
