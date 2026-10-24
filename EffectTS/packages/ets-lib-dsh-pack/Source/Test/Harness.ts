// Source/Test/Harness.ts - the shared test harness for the PACKS
// (@playform/ets-lib-dsh-pack): the tiny check counter every folder imports, the
// temporary-tree helpers (a fixture repo and a temporary home, so a smoke
// never touches the real ~/.dsh), and the standalone selfcheck that proves
// the built library loads, the built-in pack projects, the locator finds
// this monorepo and the parser parses.
//
// The library is PURE: there is no fake ctx and no factory here - the
// fixtures are real temporary directories and the real built Target.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Library from "../../Target/Library.js";

export { Library };

/** The per-folder counter: N passing checks, F failing checks. */
export type Counter = { N: number; F: number };

/** A fresh counter for one test folder. */
export const MakeCounter = (): Counter => ({ N: 0, F: 0 });

/** One check; a throw inside counts the whole group failed. */
export const Check = (Count: Counter, Label: string, Assertions: () => void): void => {
	Count.N++;
	try {
		Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/** The async variant of Check; the caller must await it to keep order. */
export const CheckAsync = async (
	Count: Counter,
	Label: string,
	Assertions: () => Promise<void>,
): Promise<void> => {
	Count.N++;
	try {
		await Assertions();
		console.log(`PASS - ${Label}`);
	} catch (_Error) {
		Count.F++;
		console.log(`FAIL - ${Label}`);
		console.log(_Error instanceof Error ? _Error.message : String(_Error));
	}
};

/** End-of-folder guard: any failed assertion is a folder failure. */
export const Finish = (Count: Counter, Name: string): number => {
	if (Count.F !== 0) {
		throw new Error(`${Name}: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

/** A fresh temporary directory under the OS temp dir. */
export const Tree = (Prefix: string): string =>
	FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/** Write one file under a root (parents created); returns the full path. */
export const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/** Remove one file or directory (a cleanup between scenarios). */
export const Drop = (Full: string): void => {
	FileSystem.rmSync(Full, { recursive: true, force: true });
};

// Standalone entry: `node Target/Test/Harness.js --selfcheck`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Count = MakeCounter();
	Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
		assert.equal(1, 1);
	});
	Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
		assert.equal(1, 2);
	});
	Check(Count, "selfcheck: the built library loads, the built-in projects and the locator resolves", () => {
		assert.equal(Object.keys(Library.Builtin.families ?? {}).length, 31);
		assert.equal(Library.Families(Library.Builtin, "doc").length, 7);
		assert.equal(Library.Families(Library.Builtin, "search").length, 10);
		assert.deepEqual(Library.Parse("a: 1"), { a: 1 });
		// A temporary home keeps the selfcheck independent of the real
		// ~/.dsh (a user-layer pack must not change the built-in proof).
		const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pack-selfcheck-home-"));
		const Located = Library.Locate("Documentation/INDEX.md", undefined, { home: Home });
		assert.notEqual(Located, undefined);
		assert.equal(Located?.pack, Library.Builtin);
	});
	if (Count.N === 3 && Count.F === 1) {
		console.log("Harness selfcheck OK");
	} else {
		console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
		process.exitCode = 1;
	}
}
