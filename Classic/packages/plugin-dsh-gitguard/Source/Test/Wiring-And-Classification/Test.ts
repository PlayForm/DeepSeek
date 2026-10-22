// Source/Test/Wiring-And-Classification/Test.ts - the wiring and the
// classifier: the loader contract (the default object carries
// name/apply/Config/inject, apply returns nothing), the IDLE-forever cold
// mount, the activation proof, the tools/pre-execute registration on the
// plugin context (never the root), the classification table (allow, deny,
// strict, the allow-list win, compounds, env prefixes, flags, bare git), and
// the fail-loud validation.
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Plugin,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
			assert.equal((Plugin as any).name, "plugin-dsh-gitguard");
			assert.equal(typeof (Plugin as any).apply, "function");
			assert.ok((Plugin as any).Config);
			assert.deepEqual((Plugin as any).inject, ["pluginFactory"]);
		});
		Check(Count, "L1: apply returns NOTHING and the state probe exists", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.State !== undefined);
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.Allow.length, 7);
			assert.equal(Run.State.Deny.length, 23);
		});
	}

	// Group W1: the cold mount (the IDLE-forever posture).
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["gitguard: disabled (enabled=false)"]);
		});
		Check(Count, "W1: a disabled mount wires NOTHING - no listener anywhere", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.equal(Run.CtxListeners["tools/pre-execute"], undefined);
		});
	}

	// Group W2: the activation wiring.
	{
		const Run = Setup();
		Check(Count, "W2: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, ["gitguard: activated (strict=false, denyPatterns=23, allowPatterns=7)"]);
		});
		Check(Count, "W2: tools/pre-execute sits on the plugin context, never the root", () => {
			assert.equal(typeof Run.CtxListeners["tools/pre-execute"], "function");
			assert.equal(Run.Listeners["tools/pre-execute"], undefined);
			assert.notEqual(Run.Root, Run.Context);
		});
	}

	// Group F1: the classification table (the real Decide over the real state).
	{
		const Run = Setup();
		const Decide = (await import("../../Function/Decide.js")).default;
		Check(Count, "F1: the read-only checks are allowed", () => {
			for (const Command of ["git status", "git log --oneline", "git diff HEAD", "git show", "git rev-parse HEAD", "git ls-files", "git fetch origin"]) {
				assert.equal(Decide(Run.State, Command).verdict, "allow", Command);
			}
		});
		Check(Count, "F1: every default deny-listed mutation is denied", () => {
			for (const Sub of Run.State.Deny) {
				const Decision = Decide(Run.State, `git ${Sub} x`);
				assert.equal(Decision.verdict, "deny", Sub);
				assert.equal(Decision.subcommand, Sub, Sub);
				assert.equal(Decision.reason, `deny-list: git ${Sub}`, Sub);
			}
		});
		Check(Count, "F1: non-git commands are allowed (not judged)", () => {
			assert.deepEqual(Decide(Run.State, "ls -la"), { verdict: "allow", reason: "not a git command" });
			assert.deepEqual(Decide(Run.State, "pnpm --dir x run prepublishOnly"), {
				verdict: "allow",
				reason: "not a git command",
			});
		});
		Check(Count, "F1: env prefixes and flags are skipped; bare git is not denied", () => {
			assert.equal(Decide(Run.State, "GIT_EDITOR=vim git commit -m y").verdict, "deny");
			assert.equal(Decide(Run.State, "git --no-pager log").verdict, "allow");
			assert.equal(Decide(Run.State, "git").verdict, "allow");
			assert.equal(Decide(Run.State, "git --version").verdict, "allow");
		});
	}

	// Group F2: compounds and the allow-list win.
	{
		const Run = Setup({ allowPatterns: ["push"] });
		const Decide = (await import("../../Function/Decide.js")).default;
		Check(Count, "F2: a compound is judged by its worst segment", () => {
			assert.equal(Decide(Run.State, "cd repo && git add -A").verdict, "deny");
			assert.equal(Decide(Run.State, "git status; git commit -m x").subcommand, "commit");
		});
		Check(Count, "F2: the allow-list wins over the deny-list", () => {
			assert.deepEqual(Decide(Run.State, "git push origin main"), {
				verdict: "allow",
				reason: "not deny-listed",
			});
		});
	}

	// Group F3: strict mode.
	{
		const Run = Setup({ strict: true, allowPatterns: ["status"] });
		const Decide = (await import("../../Function/Decide.js")).default;
		Check(Count, "F3: strict denies every git command, allow-list included", () => {
			assert.deepEqual(Decide(Run.State, "git status"), {
				verdict: "deny",
				reason: "strict mode denies every git command (status)",
				subcommand: "status",
			});
			assert.deepEqual(Decide(Run.State, "ls -la"), { verdict: "allow", reason: "not a git command" });
		});
	}

	// Group X1: the fail-loud validation.
	{
		Check(Count, "X1: a non-array denyPatterns fails loud at load", () => {
			assert.throws(() => Validate({ logFile: Ledger, enabled: true, denyPatterns: "add" }), Error);
		});
		Check(Count, "X1: a non-string member fails loud at load", () => {
			assert.throws(() => Validate({ logFile: Ledger, enabled: true, allowPatterns: [1] }), Error);
		});
	}
	return Finish(Count, "Wiring-And-Classification");
};

// Standalone entry: `node Target/Test/Wiring-And-Classification/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Classification`);
}
