// Source/Test/Policy/Test.ts - one singular test: the update-policy loader's
// read -> fallback -> diagnostics mechanics - absent file, readable file,
// unreadable file, and the Quiet form that skips every diagnostic.
// Runs standalone (`node Target/Test/Policy/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import { Check, Finish, MakeCounter, TempRoot } from "../Harness.js";
import { Policy } from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Policy - the read -> fallback -> diagnostics mechanics. The
	// fixture is the tmpdir root from the harness; the diagnostics are the
	// module's contract strings.
	const Root = TempRoot("core-smoke-");
	const Lines: string[] = [];
	const Append = (Message: string) => Lines.push(Message);
	const Defaults = { reject: [], verifyCommand: null };
	// Sub-scenario 1: absent file -> the built-in default + the no-policy +
	// default lines.
	{
		const Sub = "Policy: absent file \u2192 built-in default + the byte-identical diagnostics";
		{
			Check(Count, Sub, () => {
				const P1 = Policy(Append, Path.join(Root, "nope.json"), Defaults);
				assert.equal(
					P1,
					Defaults,
					"absent file \u2192 the module's built-in default object",
				);
				assert.deepEqual(
					Lines,
					[
						`update: no policy at ${Path.join(Root, "nope.json")} \u2014 using built-in default`,
						"update: using built-in default policy",
					],
					"the two byte-identical diagnostic lines",
				);
			});
		}
	}
	// Sub-scenario 2: readable file -> the file's policy, silence.
	{
		const Sub = "Policy: readable file \u2192 the file's policy, silent";
		{
			Check(Count, Sub, () => {
				Lines.length = 0;
				FileSystem.writeFileSync(
					Path.join(Root, "policy.json"),
					JSON.stringify({ reject: ["chalk"], verifyCommand: "npm test" }),
				);
				const P2 = Policy(Append, Path.join(Root, "policy.json"), Defaults);
				assert.deepEqual(
					P2,
					{ reject: ["chalk"], verifyCommand: "npm test" },
					"readable file \u2192 its policy",
				);
				assert.equal(Lines.length, 0, "no diagnostics on the happy path");
			});
		}
	}
	// Sub-scenario 3: unreadable file -> the fallback + the unreadable
	// diagnostic.
	{
		const Sub = "Policy: unreadable file \u2192 built-in default + the unreadable diagnostic";
		{
			Check(Count, Sub, () => {
				Lines.length = 0;
				FileSystem.writeFileSync(Path.join(Root, "bad.json"), "{ not json");
				const P3 = Policy(Append, Path.join(Root, "bad.json"), Defaults);
				assert.equal(P3, Defaults, "unreadable file \u2192 the built-in default");
				assert.deepEqual(
					Lines,
					[
						`update: unreadable policy at ${Path.join(Root, "bad.json")} \u2014 using built-in default`,
						"update: using built-in default policy",
					],
					"the unreadable + default diagnostics",
				);
			});
		}
	}
	// Sub-scenario 4: the Quiet form - no diagnostics, same result.
	{
		const Sub = "Policy: the Quiet form skips every diagnostic";
		{
			Check(Count, Sub, () => {
				Lines.length = 0;
				const P4 = Policy(Append, Path.join(Root, "nope.json"), Defaults, true);
				assert.equal(P4, Defaults, "quiet \u2192 the built-in default");
				assert.equal(Lines.length, 0, "quiet \u2192 no diagnostic lines");
			});
		}
	}
	return Finish(Count, "Policy");
};

// Standalone entry: `node Target/Test/Policy/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Policy`);
}
