import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Plugin,
	rm,
	Validate,
} from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the git-guard's wiring and classifier.
 *
 * @remarks
 *
 * The test covers the loader contract (the default object carries
 * name/apply/Config/inject, apply returns nothing), the base trio
 * defaults, the disabled cold mount (enabled: false, explicit - the shipped
 * default is the live posture), the activation proof, the tools/pre-execute registration on the
 * plugin context (never the root), the classification table (allow, deny,
 * strict, the allow-list win, compounds, env prefixes, flags, bare git), and
 * the fail-loud validation.
 */
/**
 * A standard enabled mount.
 */
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
		Check(Count, "L1: the base trio - enabled, log and logFile fill the documented defaults", () => {
			const Raw: any = Validate({});
			const Get = (Value: any): any =>
				typeof Value?.get === "function" ? Value.get() : Value;
			assert.equal(Get(Raw.enabled), true, "the live posture is the shipped default");
			assert.equal(Get(Raw.log), true, "the ledger toggle default");
			assert.equal(
				Get(Raw.logFile),
				"~/.dsh/playform/plugin-dsh-gitguard.log",
				"the ledger path default",
			);
		});
	}

	// Group W1: the disabled cold mount (the shipped default is the live
	// posture, so the disabled mount is asserted with the flag explicit).
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "W1: the disabled mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["gitguard: disabled (enabled=false)"]);
		});
		Check(Count, "W1: the disabled mount still registers the listener (the unconditional posture)", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.equal(typeof Run.CtxListeners["tools/pre-execute"], "function");
		});
		await CheckAsync(Count, "W1: the disabled guard passes through with zero ledger lines", async () => {
			const Decision = await Run.CtxListeners["tools/pre-execute"]("git commit -m x", async () => "down");
			assert.equal(Decision, "down");
			assert.equal(Run.Lines.length, 1, "nothing logged while disabled");
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
