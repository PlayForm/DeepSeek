// Source/Test/Contract-And-Wiring/Test.ts - the apply/inject contract of
// the workspace-live client entry and its apply-time wiring: the loader
// row contract, the Config schema defaults and the fail-loud validation,
// the client inject list, the provided workspaceLive service, the effect
// labels, the byte-exact locale registration, the tab renderer
// registration, and the purity probe on the real built code.
import assert from "node:assert/strict";
import {
	BuiltSource,
	Check,
	Finish,
	MakeCounter,
	Make,
	ClientPlugin,
	Plugin,
	Validate,
} from "../Harness.js";

export const runTest = (): number => {
	const Count = MakeCounter();

	// Group W1: the loader row contract (the host half is empty by design).
	Check(Count, "W1: the loader row carries name/apply/Config/inject", () => {
		assert.equal(Plugin.name, "client-dsh-workspace-live");
		assert.equal(typeof Plugin.apply, "function");
		assert.equal(typeof Plugin.Config, "function");
		assert.deepEqual(Plugin.inject, []);
		assert.equal(Plugin.apply(), undefined);
		assert.deepEqual(Plugin, { name: Plugin.name, apply: Plugin.apply, Config: Plugin.Config, inject: [] });
	});

	// Group W2-W4: the Config schema.
	Check(Count, "W2: the schema fills the exact defaults (volatile cells unwrap)", () => {
		const Value = Validate({});
		const Cell = (Key: string): any => {
			const Field = Value[Key];
			return typeof Field?.get === "function" ? Field.get() : Field;
		};
		assert.deepEqual(
			{
				enabled: Cell("enabled"),
				tabOrder: Cell("tabOrder"),
				maxEvents: Cell("maxEvents"),
				maxRepresentations: Cell("maxRepresentations"),
			},
			{ enabled: false, tabOrder: 25, maxEvents: 50, maxRepresentations: 100 },
		);
	});
	Check(Count, "W3: maxEvents outside its bounds fails loud at load", () => {
		assert.throws(() => Validate({ maxEvents: 0 }));
		assert.throws(() => Validate({ maxEvents: 501 }));
	});
	Check(Count, "W4: maxRepresentations outside its bounds fails loud at load", () => {
		assert.throws(() => Validate({ maxRepresentations: 0 }));
		assert.throws(() => Validate({ maxRepresentations: 1001 }));
	});

	// Group W5-W8: the client apply contract.
	{
		const Run = Make();
		Check(Count, "W5: the client half requires slots and locale", () => {
			assert.deepEqual(Plugin.inject, []);
			assert.deepEqual(ClientPlugin.inject, ["slots", "locale"]);
		});
		Check(Count, "W6: the workspaceLive service is provided with the four methods", () => {
			const Service = Run.Provided["workspaceLive"];
			assert.equal(typeof Service, "object");
			for (const Method of ["getSnapshot", "subscribe", "ingest", "refresh"]) {
				assert.equal(typeof Service[Method], "function");
			}
		});
		Check(Count, "W7: the effect labels are byte-exact and in order", () => {
			assert.deepEqual(Run.Effects, ["live: dictionaries", "live: workspace tab"]);
		});
		Check(Count, "W8: the locale registration is captured once, byte-exact", () => {
			assert.deepEqual(Run.Locale, [
				{
					namespace: "client-dsh-workspace-live",
					dictionaries: {
						en: {
							tab: "Workspace",
							empty: "No workspace representations are presented yet.",
						},
						zh: {
							tab: "工作区",
							empty: "尚无工作区表现。",
						},
					},
				},
			]);
		});
	}

	// Group W9-W10: the tab renderer registration (the slot contract).
	{
		const Run = Make();
		const [TabRecord] = Run.OpenSlot("conversation.view");
		Check(Count, "W9: the workspace-live tab registers with the exact options", () => {
			assert.deepEqual(
				{ ...TabRecord.options, label: undefined },
				{
					name: "conversation.view",
					id: "workspace-live",
					order: 25,
					locale: "client-dsh-workspace-live",
					label: undefined,
				},
			);
			assert.equal(TabRecord.options.label(), "Workspace");
		});
		Check(Count, "W10: the tab component is the LiveTab element bound to the store", () => {
			const Element = TabRecord.component() as any;
			assert.equal(typeof Element.type, "function");
			assert.equal(typeof Element.props.store.getSnapshot, "function");
			assert.equal(typeof Element.props.store.subscribe, "function");
		});
		Check(Count, "W11: no other slot point is injected", () => {
			assert.deepEqual(Object.keys(Run.Injects), ["conversation.view"]);
		});
	}

	// Group W12: the purity probe on the real built code.
	Check(Count, "W12: the built client touches no Node API, fs or timer", () => {
		const Source = BuiltSource("../Client.js");
		const Store = BuiltSource("../Function/Store.js");
		for (const Text of [Source, Store]) {
			assert.equal(/node:/.test(Text), false);
			assert.equal(/require\(/.test(Text), false);
			assert.equal(/setInterval|setTimeout/.test(Text), false);
		}
	});

	return Finish(Count, "Contract-And-Wiring");
};

// Standalone entry: `node Target/Test/Contract-And-Wiring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Contract-And-Wiring`);
}
