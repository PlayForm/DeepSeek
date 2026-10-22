// Source/Test/Contract-And-Wiring/Test.ts - the apply/inject contract of
// the client entry and the apply-time wiring: the loader row contract, the
// Config schema defaults and the fail-loud validation, the client inject
// list, the provided registry service, the effect labels, the byte-exact
// locale registrations, the two slot points and the tab renderer
// registration, and the purity probe on the real built code.
import assert from "node:assert/strict";
import {
	BuiltClientSource,
	Check,
	Finish,
	MakeCounter,
	Make,
	Plugin,
	ClientPlugin,
	Validate,
} from "../Harness.js";

export const runTest = (): number => {
	const Count = MakeCounter();

	// Group C1: the loader row contract (the host half is empty by design).
	Check(Count, "C1: the loader row carries name/apply/Config/inject", () => {
		assert.equal(Plugin.name, "client-dsh-panel-family");
		assert.equal(typeof Plugin.apply, "function");
		assert.equal(typeof Plugin.Config, "function");
		assert.deepEqual(Plugin.inject, []);
		assert.equal(Plugin.apply(), undefined);
		assert.deepEqual(Plugin, { name: Plugin.name, apply: Plugin.apply, Config: Plugin.Config, inject: [] });
	});

	// Group C2: the Config schema.
	Check(Count, "C2: the schema fills the exact defaults (volatile cells unwrap)", () => {
		const Value = Validate({});
		// Every knob is volatile: the schema returns `{ get }` cells; the
		// loader unwraps them. Read through the cells.
		const Cell = (Key: string): any => {
			const Field = Value[Key];
			return typeof Field?.get === "function" ? Field.get() : Field;
		};
		assert.deepEqual(
			{
				enabled: Cell("enabled"),
				tabOrder: Cell("tabOrder"),
				overlayMaxWidth: Cell("overlayMaxWidth"),
				locale: Cell("locale"),
			},
			{ enabled: true, tabOrder: 20, overlayMaxWidth: 720, locale: "en" },
		);
	});
	Check(Count, "C3: an invalid locale fails loud at load", () => {
		assert.throws(() => Validate({ locale: "fr" }));
	});

	// Group C4-C6: the client apply contract.
	{
		const Run = Make();
		Check(Count, "C4: the client half requires slots and locale", () => {
			// The host half requires nothing; the client entry requires the two.
			assert.deepEqual(Plugin.inject, []);
			assert.deepEqual(ClientPlugin.inject, ["slots", "locale"]);
		});
		Check(Count, "C5: the registry service is provided under playformFamilyPanel", () => {
			const Registry = Run.Provided["playformFamilyPanel"];
			assert.equal(typeof Registry, "object");
			for (const Method of ["register", "unregister", "entries", "subscribe", "getVersion", "open"]) {
				assert.equal(typeof Registry[Method], "function");
			}
		});
		Check(Count, "C6: the effect labels are byte-exact and in order", () => {
			assert.deepEqual(Run.Effects, ["panel: dictionaries", "panel: family tab", "panel: overlay mount"]);
		});
		Check(Count, "C7: the locale registration is captured once, byte-exact", () => {
			assert.deepEqual(Run.Locale, [
				{
					namespace: "client-dsh-panel-family",
					dictionaries: {
						en: {
							tab: "Family",
							empty: "No family sections are registered yet.",
							overlay: "Family panel",
							close: "Close",
						},
						zh: {
							tab: "家族",
							empty: "尚未注册任何家族板块。",
							overlay: "家族面板",
							close: "关闭",
						},
					},
				},
			]);
		});
		Check(Count, "C8: the two slot points are injected on their exact slots", () => {
			assert.deepEqual(Object.keys(Run.Injects), ["conversation.view", "shell.overlay"]);
		});
	}

	// Group C9-C10: the tab renderer registration (the slot contract).
	{
		const Run = Make();
		const [TabRecord] = Run.OpenSlot("conversation.view");
		Check(Count, "C9: the family tab registers with the exact options", () => {
			assert.deepEqual(
				{ ...TabRecord.options, label: undefined },
				{
					name: "conversation.view",
					id: "playform-family",
					order: 20,
					locale: "client-dsh-panel-family",
					label: undefined,
				},
			);
			assert.equal(TabRecord.options.label(), "Family");
		});
		Check(Count, "C10: the tab component is the FamilyTab element bound to the registry", () => {
			const Element = TabRecord.component() as any;
			assert.equal(typeof Element.type, "function");
			assert.equal(Element.props.registry, Run.Provided["playformFamilyPanel"]);
		});
		const [OverlayRecord] = Run.OpenSlot("shell.overlay");
		Check(Count, "C11: the overlay mount registers with the exact options", () => {
			assert.deepEqual(
				{ ...OverlayRecord.options, label: undefined },
				{
					name: "shell.overlay",
					id: "playform-family-overlay",
					locale: "client-dsh-panel-family",
					label: undefined,
				},
			);
			assert.equal(OverlayRecord.options.label(), "Family panel");
		});
		Check(Count, "C12: the overlay component is the styled overlay container", () => {
			const Element = OverlayRecord.component() as any;
			assert.equal(Element.type, "div");
			assert.equal(Element.props.className, "playform-family-overlay");
			assert.deepEqual(Element.props.style, { maxWidth: 720 });
		});
	}

	// Group C13: the purity probe on the real built code.
	Check(Count, "C13: the built client touches no Node API and no fs", () => {
		const Source = BuiltClientSource();
		assert.equal(/node:/.test(Source), false);
		assert.equal(/require\(/.test(Source), false);
		assert.equal(/readFileSync|writeFileSync/.test(Source), false);
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
