// Source/Test/Registry-And-Sections/Test.ts - the playformFamilyPanel
// registry body, exercised through the instance the client apply actually
// provided: register adds and replaces by id, entries snapshots ordered by
// (order, id), subscribe/getVersion track every mutation, open() delegates
// to the attached implementation (and only records before one is
// attached), the register disposer unregisters, and unregister of an
// unknown id is a no-op.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make } from "../Harness.js";

/** A minimal section (the adapters' contribution: id, bundle, namespace,
 *  title, order, mount, render). */
const Section = (Id: string, Order: number, Mount: any = "family-tab"): any => ({
	id: Id,
	bundle: `bundle-${Id}`,
	namespace: Id,
	title: `Section ${Id}`,
	order: Order,
	mount: Mount,
	render: () => null,
});

export const runTest = (): number => {
	const Count = MakeCounter();
	const Run = Make();
	const Registry = Run.Provided["playformFamilyPanel"] as any;

	Check(Count, "R1: register adds a section and entries snapshots it", () => {
		Registry.register(Section("a", 10));
		// The registry is the live service the client apply provided, so the
		// three reference adapters are already registered; the fixture's own
		// section is what this suite tracks.
		assert.deepEqual(
			Registry.entries()
				.map((S: any) => S.id)
				.filter((Id: string) => !Id.startsWith("adapter-")),
			["a"],
		);
	});
	Check(Count, "R2: re-registering the same id replaces in place", () => {
		const Before = Registry.entries().length;
		Registry.register(Section("a", 10));
		assert.equal(Registry.entries().length, Before);
		assert.equal(Registry.entries()[0].order, 10);
	});
	Check(Count, "R3: entries order by (order, id)", () => {
		Registry.register(Section("z", 10));
		Registry.register(Section("b", 20));
		assert.deepEqual(
			Registry.entries()
				.map((S: any) => S.id)
				.filter((Id: string) => !Id.startsWith("adapter-")),
			["a", "z", "b"],
		);
	});
	Check(Count, "R4: every mutation bumps the version and notifies once", () => {
		let Calls = 0;
		const Unlisten = Registry.subscribe(() => {
			Calls += 1;
		});
		const Version = Registry.getVersion();
		Registry.register(Section("sub", 30));
		assert.equal(Registry.getVersion(), Version + 1);
		assert.equal(Calls, 1);
		Unlisten();
		Registry.register(Section("sub2", 30));
		assert.equal(Calls, 1);
		assert.equal(Registry.getVersion(), Version + 2);
	});
	Check(Count, "R5: open() records the request and never notifies", () => {
		const Version = Registry.getVersion();
		let Launched: unknown = "unset";
		Registry.AttachOpen((Target: any) => {
			Launched = Target;
		});
		const Target = { view: "review", focus: "doc" };
		Registry.open(Target);
		assert.equal(Launched, Target);
		assert.equal(Registry.getVersion(), Version);
	});
	Check(Count, "R6: the register disposer unregisters", () => {
		const Disposer = Registry.register(Section("tmp", 40));
		assert.ok(Registry.entries().some((S: any) => S.id === "tmp"));
		Disposer();
		assert.ok(!Registry.entries().some((S: any) => S.id === "tmp"));
	});
	Check(Count, "R7: unregister of an unknown id is a no-op", () => {
		let Calls = 0;
		const Unlisten = Registry.subscribe(() => {
			Calls += 1;
		});
		const Version = Registry.getVersion();
		Registry.unregister("nope");
		assert.equal(Registry.getVersion(), Version);
		assert.equal(Calls, 0);
		Unlisten();
	});

	return Finish(Count, "Registry-And-Sections");
};

// Standalone entry: `node Target/Test/Registry-And-Sections/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Registry-And-Sections`);
}
