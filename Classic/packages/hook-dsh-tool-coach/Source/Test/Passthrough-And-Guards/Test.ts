// Source/Test/Passthrough-And-Guards/Test.ts - one singular test: the
// zero-noise paths - legitimate bash passes through with NO additionalContexts
// and no ledger noise (R1), the fail-open envelope turns a malformed payload
// into a prefixed warning instead of a throw, and the dedicated tools are
// never judged. Runs standalone
// (`node Target/Test/Passthrough-And-Guards/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-tool-coach. The assertions are moved
// verbatim from Classic/smokes/tool-coach-smoke.mjs (R1 + the fail-open
// envelope checks + the non-judged check).
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Make,
	MakeCounter,
	Validate,
	Ledger,
	Post,
	rm,
	ACCEPT,
	Agent,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: R1 - legitimate bash passthrough.
	{
		rm();
		const RunR1 = Make(Validate({ logFile: Ledger }));
		const Legit = [
			"git status",
			"pnpm build",
			"node x.js",
			"ls",
			"rm -rf build",
			"python script.py",
			"make",
			"docker ps",
			"echo hello",
			"true",
		];
		await CheckAsync(
			Count,
			"R1: all 10 legitimate calls pass through with NO additionalContexts",
			async () => {
				let Passthrough = true;
				for (const Command of Legit) {
					const Out = await Post(RunR1, Command);
					if (Out !== ACCEPT) {
						Passthrough = false;
					}
				}
				assert.ok(Passthrough);
			},
		);
		Check(Count, "R1: the only ledger line is the activation", () => {
			assert.ok(
				RunR1.Lines.filter((L: string) => L.startsWith("hook-dsh-tool-coach: activated")).length === 1,
			);
		});
		Check(Count, "R1: no warnings (no listener ever throws)", () => {
			assert.equal(RunR1.Warns.length, 0);
		});
	}
	// Group: the fail-open envelope (the malformed payload guard).
	{
		rm();
		const RunR1 = Make(Validate({ logFile: Ledger }));
		const Cyclical: any = {};
		Cyclical.self = Cyclical;
		await CheckAsync(
			Count,
			"a malformed (cyclic) payload returns the downstream decision unchanged",
			async () => {
				const Out = await RunR1.Listeners["tools/post-execute"](
					{ callId: "c", name: "bash", arguments: Cyclical, agent: Agent("agent-a"), signal: undefined },
					{ isError: false, value: "", content: [] },
					async () => ACCEPT,
				);
				assert.ok(Out === ACCEPT);
			},
		);
		Check(Count, "the fail-open envelope logs a prefixed warning instead of throwing", () => {
			assert.ok(RunR1.Warns.some((W: string) => W.startsWith("hook-dsh-tool-coach: ")));
		});
	}
	// Group: the dedicated tools are never judged.
	{
		rm();
		const RunNJ = Make(Validate({ logFile: Ledger }));
		await Post(RunNJ, "cat a.md", Agent("agent-nj"), "read");
		await Post(RunNJ, "sed -i s/x/y/ f", Agent("agent-nj"), "write");
		await CheckAsync(Count, "the dedicated tools are never judged (read/write calls)", async () => {
			assert.ok(RunNJ.Lines.every((L: string) => !L.includes(": offense")));
		});
	}
	return Finish(Count, "Passthrough-And-Guards");
};

// Standalone entry: `node Target/Test/Passthrough-And-Guards/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Passthrough-And-Guards`);
}
