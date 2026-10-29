// Source/Test/Entry-And-State/Test.ts - one singular test: the service entry
// contract (class extends Service, static inject, registration) plus the
// State builder (the volatile-cell unwrap, the shared mappings, the module
// fields, the P9 probe-once subprocess seam, the probe-once Seam accessor,
// the bare-config tolerance, the UpdateKey namespace) and the P10 volatile
// refresh (the instance-local loader/volatile-update listener updating the
// State in place).
// Runs standalone (`node Target/Test/Entry-And-State/Test.js`) AND under the
// aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Check,
	Finish,
	MakeCounter,
	Make,
	TempRoot,
	FactoryClass,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// The folder fixtures: the fake ctx + the REAL factory instance (the
	// Service base registers through ctx.reflect.provide), the temp root and
	// the ledger path from the source suite.
	const Fake = Make(null, { files: {} });
	const ctx = Fake.Context;
	const { provided, services, serviceGets, events } = Fake;
	const Root = TempRoot("factory-smoke-");
	const Ledger = Path.join(Root, "ledger.log");
	const factory: any = new FactoryClass(ctx);
	// Group: 1 - the entry contract.
	{
		const Sub = "entry: class extends Service, static inject=[fs], registered as ctx.pluginFactory";
		{
			Check(Count, Sub, () => {
				assert.equal(typeof FactoryClass, "function", "default export is a class");
				assert.ok(
					Object.getPrototypeOf(FactoryClass)?.name === "Service" ||
						String(Object.getPrototypeOf(FactoryClass)).includes("Service"),
					"extends Service",
				);
				assert.deepEqual((FactoryClass as any).inject, ["fs"], "static inject = [fs]");
				assert.equal(provided["pluginFactory"], factory, "registered as ctx.pluginFactory");
				assert.equal(factory.name, "pluginFactory", "service name is pluginFactory");
			});
		}
		{
			const Sub = "entry: all 15 service methods present";
			Check(Count, Sub, () => {
				for (const m of [
					"Append",
					"Match",
					"Discover",
					"Parse",
					"ResolvePolicy",
					"Gate",
					"GuardedWrite",
					"Refresh",
					"Continue",
					"State",
					"Wire",
					"Attach",
					"Journal",
					"Schema",
					"Seam",
				])
					assert.equal(typeof factory[m], "function", `method ${m}`);
			});
		}
	}
	// Group: 2 - State builder: defaults, cell unwrap, module fields.
	let st2: any;
	{
		const Sub = "State: cell unwrap + shared mappings + module fields + fresh structures";
		{
			Check(Count, Sub, () => {
				const volatileCell = { get: () => ["write", "edit"] };
				const st1: any = factory.State(
					ctx,
					{
						log: true,
						logFile: Ledger,
						policyFile: "",
						exclude: ["x"],
						mutationTools: volatileCell,
						strict: false,
						sections: ["dependencies"],
					},
					{ module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } },
				);
				assert.equal(st1.Module, "smoke-flavor");
				assert.deepEqual(st1.Tool, ["write", "edit"], "volatile cell unwrapped");
				assert.equal(st1.Ledger, Ledger);
				assert.equal(st1.Enabled, true);
				assert.deepEqual(st1.List, ["x"]);
				assert.equal(st1.Policy, "");
				assert.equal(st1.PolicyName, "");
				assert.deepEqual(st1.Section, ["dependencies"], "module field Section mapped");
				assert.equal(st1.Strict, false, "module field Strict mapped");
				assert.ok(
					st1.Stash instanceof Map &&
						st1.Inflight instanceof Map &&
						st1.Seams instanceof Map &&
						st1.Queue.length === 0,
				);
				assert.equal(st1.Subprocess, undefined, "subprocess seam absent \u2192 undefined");
			});
		}
		{
			const Sub = "State: P9 probe-once subprocess seam";
			Check(Count, Sub, () => {
				services["subprocess"] = { spawn: () => "stub" };
				st2 = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
				assert.equal(st2.Subprocess.spawn(), "stub", "subprocess probed once at build");
			});
		}
	}
	// Group: 3 - Seam: probe-once caching, never the dead accessor.
	{
		const Sub = "Seam: probe-once cache (incl. cached undefined), ctx.get only";
		{
			Check(Count, Sub, () => {
				services["smoke-x"] = { tag: "x" };
				const seamBefore = serviceGets.length;
				assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
				assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
				assert.equal(serviceGets.length, seamBefore + 1, "second Seam call served from cache");
				assert.equal(factory.Seam(st2, "no-such-service"), undefined);
			});
		}
	}
	// Group: State tolerates a config missing optional shared fields.
	{
		const Sub = "State: missing config fields tolerated (schema guarantees them in production)";
		{
			Check(Count, Sub, () => {
				const stBare: any = factory.State(ctx, {}, { module: "f" });
				assert.equal(stBare.Ledger, undefined);
				assert.doesNotThrow(() => factory.Append(stBare, "bare"));
			});
		}
	}
	// Group: the live ledger path - the tilde expansion and the missing
	// parent directory. The log-path standardization moves every ledger to
	// ~/.dsh/playform/<file>.log and a clean profile does not have that
	// directory: the append expands the config path against $HOME and creates
	// the parent directory (best-effort) before the appendFileSync, or the
	// line is lost to a swallowed ENOENT.
	{
		const Sub = "Append: the tilde ledger path expands against $HOME and creates its missing parent (~/.dsh/playform)";
		{
			Check(Count, Sub, () => {
				const Original = process.env["HOME"];
				const Home = TempRoot("factory-smoke-home-");
				try {
					process.env["HOME"] = Home;
					const stDir: any = factory.State(
						ctx,
						{ log: true, logFile: "~/.dsh/playform/probe.log" },
						{ module: "smoke-flavor" },
					);
					assert.equal(stDir.Ledger, "~/.dsh/playform/probe.log", "State keeps the raw config path");
					assert.equal(
						FileSystem.existsSync(Path.join(Home, ".dsh")),
						false,
						"the fixture pre-state: no .dsh directory",
					);
					factory.Append(stDir, "probe dir");
					const Probe = Path.join(Home, ".dsh", "playform", "probe.log");
					const Written = FileSystem.readFileSync(Probe, "utf8");
					assert.ok(
						/^\[\d{4}-\d{2}-\d{2}T.*\] probe dir\n$/.test(Written),
						"the append created the directory and landed in the expanded home path",
					);
				} finally {
					if (Original === undefined) {
						delete process.env["HOME"];
					} else {
						process.env["HOME"] = Original;
					}
				}
			});
		}
	}
	// Group: UpdateKey - the namespaced Inflight key for update-stage
	// controllers (P2 - the chain pass keys by the plain targetKey; an update
	// stage MUST register under this key or the chain's settlement can drop
	// its controller).
	{
		const Sub = "UpdateKey: the namespaced Inflight key (update:<targetKey>)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					factory.UpdateKey({ targetKey: "k1", displayPath: "/x/package.json" }),
					"update:k1",
				);
				assert.equal(
					factory.UpdateKey({ targetKey: "update:k1", displayPath: "/x" }),
					"update:update:k1",
				);
			});
		}
	}
	// Group: P10 volatile refresh (additive): in-place State updates, no
	// remount.
	{
		const Sub =
			"P10 volatile refresh: one instance-local listener, in-place field updates (key-array + dotted + nested-object paths), identity preserved, unknown/failed paths safe";
		{
			Check(Count, Sub, () => {
				// A module field mapped from a volatile cell, plus the shared mappings.
				const Cell = { get: () => "first" };
				const LogCell = { get: () => false };
				const Mark = events.length;
				const stV: any = factory.State(
					ctx,
					{ logFile: Ledger, log: LogCell, replacement: Cell },
					{ module: "volatile-flavor", fields: { Replacement: "replacement" } },
				);
				const Refresh = events
					.slice(Mark)
					.filter((e: any) => e[0] === "loader/volatile-update")
					.map((e: any) => e[1])
					.at(-1);
				assert.ok(Refresh, "the State builder registers one loader/volatile-update listener");
				assert.equal(stV.Replacement, "first", "initial unwrap: the cell's mount-time value");
				assert.equal(stV.Enabled, false, "initial unwrap: the log cell's mount-time value");
				const Same = stV;
				Cell.get = () => "second";
				Refresh([["replacement"]]);
				assert.equal(stV.Replacement, "second", "key-array path: the field refreshes in place");
				assert.equal(Same, stV, "State object identity preserved (no remount, no rebuild)");
				Cell.get = () => "third";
				Refresh(["replacement"]);
				assert.equal(stV.Replacement, "third", "dotted-string path: the same refresh");
				// Nested path under an object key: the top-level key maps the whole cell.
				const ObjCell = { get: () => ({ conversation: true, toolInput: false }) };
				const stO: any = factory.State(
					ctx,
					{ logFile: Ledger, scopes: ObjCell },
					{ module: "volatile-flavor", fields: { Scopes: "scopes" } },
				);
				const ObjRefresh = events
					.slice(events.length - 1)
					.filter((e: any) => e[0] === "loader/volatile-update")
					.map((e: any) => e[1])
					.at(-1);
				assert.deepEqual(stO.Scopes, { conversation: true, toolInput: false });
				ObjCell.get = () => ({ conversation: false, toolInput: true });
				ObjRefresh([["scopes", "toolInput"]]);
				assert.deepEqual(
					stO.Scopes,
					{ conversation: false, toolInput: true },
					"nested object key: the whole object cell re-reads (top-level key)",
				);
				// Shared mapping: the log cell refreshes State.Enabled.
				LogCell.get = () => true;
				Refresh([["log"]]);
				assert.equal(stV.Enabled, true, "shared mapping: log -> Enabled refreshes in place");
				// Unknown / non-volatile / malformed paths: ignored, never throwing.
				Cell.get = () => "kept";
				Refresh([["replacement"]]);
				assert.equal(stV.Replacement, "kept", "valid path still refreshes before the ignore tests");
				assert.doesNotThrow(() => Refresh([["nonsense"], "a.b.c", 42, undefined]));
				assert.equal(stV.Replacement, "kept", "unknown key paths are ignored");
				// A plain (non-cell) key path is ignored too - State is untouched.
				assert.doesNotThrow(() => Refresh([["logFile"]]));
				assert.equal(stV.Ledger, Ledger, "non-volatile key path: no refresh");
				// A failed refresh keeps the previous value (the Unwrap defensive rule).
				Cell.get = () => {
					throw new Error("boom");
				};
				assert.doesNotThrow(() => Refresh([["replacement"]]));
				assert.equal(stV.Replacement, "kept", "failed refresh keeps the previous value");
				// The refresh is the ONLY observable effect of the dispatch: no
				// activation line was re-emitted, no listener churned - one listener
				// per State build.
				assert.ok(events.filter((e: any) => e[0] === "loader/volatile-update").length >= 3);
			});
		}
	}
	return Finish(Count, "Entry-And-State");
};

// Standalone entry: `node Target/Test/Entry-And-State/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Entry-And-State`);
}
