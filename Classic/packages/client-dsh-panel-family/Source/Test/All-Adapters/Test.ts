// Source/Test/All-Adapters/Test.ts - the full THIRTEEN-ADAPTER roster,
// against the real built functions, the thirteen real manifests the package
// ships, and the real built closure-factory bundle: the roster table, the
// thirteen adapter effects, the section-slot registrations, the activation
// and trace vocabulary, the schema-derived config forms (a representative
// volatile and plain field per adapter), the two write routes on the new
// adapters, and the bundle executed through a fake `window.__ModuleLoader__`
// (it must export the same id/inject and register the same thirteen).
import assert from "node:assert/strict";
import Schema from "@deepseek-ai/schemastery";
import * as React from "react";
import {
	BundleSource,
	Check,
	Finish,
	Make,
	MakeBridge,
	MakeCounter,
	MakeForms,
} from "../Harness.js";

// The built modules load AFTER the Harness registered the alias hooks (a
// static import would link before the hooks exist, the same reason the
// Harness imports the Target dynamically).
const Apply = (await import("@Function/Apply.js")).default;
const Form = (await import("@Function/Form.js")).default;
const Live = (await import("@Function/Live.js")).default;
const Normalize = (await import("@Variable/Reference/Normalize.js")).default;
const ToolCoach = (await import("@Variable/Reference/ToolCoach.js")).default;
const Suggester = (await import("@Variable/Reference/Suggester.js")).default;
const Quotes = (await import("@Variable/Reference/Quotes.js")).default;
const Ellipsis = (await import("@Variable/Reference/Ellipsis.js")).default;
const Spaces = (await import("@Variable/Reference/Spaces.js")).default;
const Invisible = (await import("@Variable/Reference/Invisible.js")).default;
const Fullwidth = (await import("@Variable/Reference/Fullwidth.js")).default;
const NormalizeFile = (await import("@Variable/Reference/NormalizeFile.js"))
	.default;
const PackageGovernor = (await import("@Variable/Reference/PackageGovernor.js"))
	.default;
const PackagePinner = (await import("@Variable/Reference/PackagePinner.js"))
	.default;
const CargoGovernor = (await import("@Variable/Reference/CargoGovernor.js"))
	.default;
const Ccr = (await import("@Variable/Reference/Ccr.js")).default;

const Roster = [
	Normalize,
	ToolCoach,
	Suggester,
	Quotes,
	Ellipsis,
	Spaces,
	Invisible,
	Fullwidth,
	NormalizeFile,
	PackageGovernor,
	PackagePinner,
	CargoGovernor,
	Ccr,
];

// -- schema mirrors of the ten plugins' Variable/Config.ts (real Schemastery
// instances, serialized with toJSON() - the envelope the settings host
// serves) --

const Scopes = () =>
	Schema.object({
		conversation: Schema.boolean().default(true),
		reasoning: Schema.boolean().default(true),
		toolInput: Schema.boolean().default(false),
		toolResults: Schema.boolean().default(false),
		files: Schema.boolean().default(true),
		batch: Schema.boolean().default(false),
	}).volatile();

const Exempt = () =>
	Schema.array(Schema.string())
		.default([
			"read",
			"edit",
			"raw-write",
			"normalize-file",
			"ccr_retrieve",
			"subagent",
			"ask_user_question",
		])
		.volatile();

/** The file flavor's shape: the family's volatile cells with NO plain
 *  semantic gate (the plugin has no normalizeReasoning/normalizeToolArguments
 *  fields - the family's only all-volatile schema). */
const FileSchema = () =>
	Schema.object({
		log: Schema.boolean().default(true).volatile(),
		logFile: Schema.string()
			.default("~/.dsh/playform/plugin-dsh-normalize-file.log")
			.volatile(),
		replacement: Schema.string().default("-").volatile(),
		scopes: Scopes(),
		toolResultsExempt: Exempt(),
	});

/** The stream flavors' shape: the minimal shared block, the optional
 *  replacement knob, the two plain semantic gates, the volatile scopes. */
const FlavorSchema = (Replacement: boolean) =>
	Schema.object({
		log: Schema.boolean().default(true).volatile(),
		logFile: Schema.string()
			.default("~/.dsh/playform/hook-dsh-normalize.log")
			.volatile(),
		...(Replacement ? { replacement: Schema.string().default("...").volatile() } : {}),
		normalizeReasoning: Schema.boolean().default(true),
		normalizeToolArguments: Schema.boolean().default(false),
		scopes: Scopes(),
		toolResultsExempt: Exempt(),
	});

/** The governors' shared block fields (the factory's shared block mirror). */
const SharedFields = (LogFile: string): Record<string, any> => ({
	log: Schema.boolean().default(true).volatile(),
	logFile: Schema.string().default(LogFile).volatile(),
	updateCooldownMs: Schema.number().default(3000).volatile(),
	mutationTools: Schema.array(Schema.string())
		.default(["write", "edit", "str_replace_editor", "raw-write"])
		.volatile(),
	policyFile: Schema.string().default(""),
	exclude: Schema.array(Schema.string())
		.default(["node_modules", ".git", ".dsh"]),
});

const GovernorSchema = () =>
	Schema.object({
		...SharedFields("~/.dsh/playform/hook-dsh-package-governor.log"),
		strict: Schema.boolean().default(false),
		maxUpdateFailures: Schema.number().default(3),
		updateMode: Schema.string().default("programmatic"),
		ncuBin: Schema.string().default("ncu"),
	});

const PinnerSchema = () =>
	Schema.object({
		...SharedFields("~/.dsh/playform/hook-dsh-package-pinner.log"),
		sections: Schema.array(Schema.string()).default([
			"dependencies",
			"devDependencies",
			"peerDependencies",
			"optionalDependencies",
		]),
	});

const CargoSchema = () =>
	Schema.object({
		...SharedFields("~/.dsh/playform/hook-dsh-cargo-governor.log"),
		strict: Schema.boolean().default(false),
		maxUpdateFailures: Schema.number().default(3),
		cargoBin: Schema.string().default("cargo"),
		keepFile: Schema.string().default(""),
		updateMode: Schema.string().default("cargo"),
	});

const CcrSchema = () =>
	Schema.object({
		log: Schema.boolean().default(true).volatile(),
		logFile: Schema.string().default("~/.dsh/playform/hook-dsh-ccr.log").volatile(),
		targets: Schema.array(String).default([
			"bash",
			"glob",
			"grep",
			"read",
			"web_fetch",
			"web_search",
			"list",
			"search",
		]),
		exempt: Schema.array(String).default([
			"write",
			"edit",
			"raw-write",
			"subagent",
			"ask_user_question",
			"ccr_retrieve",
		]),
		thresholdBytes: Schema.number().default(2048).volatile(),
		inlineThresholdBytes: Schema.number().default(1024),
		autoExpand: Schema.boolean().default(true),
		autoExpandLimitBytes: Schema.number().default(102400),
		compressFailures: Schema.boolean().default(false),
		multipliers: Schema.object({
			terminal: Schema.number().default(1),
			error: Schema.number().default(8),
			grep: Schema.number().default(2),
			paths: Schema.number().default(2),
			file: Schema.number().default(1),
			json: Schema.number().default(1),
			web: Schema.number().default(2),
			default: Schema.number().default(1),
		}).volatile(),
		previewMaxChars: Schema.number().default(240).volatile(),
		ttlSeconds: Schema.number().default(3600),
		storeBudgetBytes: Schema.number().default(268435456),
		journalPath: Schema.string().default(""),
		contextEngine: Schema.boolean().default(false),
		contextEngineThresholdPct: Schema.number().default(30),
		protectFirstTurns: Schema.number().default(2),
		protectLastTurns: Schema.number().default(4),
	});

/** One namespace view for a mirrored schema (values + revision filled). */
const View = (Ns: string, Schema: any): any => ({
	ns: Ns,
	schema: Schema.toJSON(),
	value: Schema({}),
	base: {},
	user: {},
	revision: 9,
});

const Views = [
	View("hook-dsh-normalize-quotes", FlavorSchema(false)),
	View("hook-dsh-normalize-ellipsis", FlavorSchema(true)),
	View("hook-dsh-normalize-spaces", FlavorSchema(true)),
	View("hook-dsh-normalize-invisible", FlavorSchema(true)),
	View("hook-dsh-normalize-fullwidth", FlavorSchema(false)),
	View("plugin-dsh-normalize-file", FileSchema()),
	View("hook-dsh-package-governor", GovernorSchema()),
	View("hook-dsh-package-pinner", PinnerSchema()),
	View("hook-dsh-cargo-governor", CargoSchema()),
	View("hook-dsh-ccr", CcrSchema()),
];

const NewAdapterFor = (Namespace: string): any =>
	Roster.find((Section: any) => Section.namespace === Namespace);

const Derived = (Section: any, NamespaceView: any): any =>
	Form(Section, {
		view: NamespaceView,
		writable: true,
		available: true,
		bridge: true,
	});

const FieldNamed = (FormView: any, Label: string): any =>
	FormView.fields.find((Entry: any) => Entry.label === Label);

/** A minimal ports object; every capture is exposed for the assertions. */
const Ports = (Options: any = {}): any => {
	const Info: string[] = [];
	const Warn: string[] = [];
	return {
		registry: {
			register: () => () => undefined,
			unregister: () => undefined,
			entries: () => [],
			subscribe: () => () => undefined,
			getVersion: () => 0,
			open: () => undefined,
		},
		live: Live(undefined, []),
		open: () => undefined,
		log: {
			info: (Message: string) => Info.push(Message),
			warn: (Message: string) => Warn.push(Message),
		},
		...(Options.configForms === undefined ? {} : { configForms: Options.configForms }),
		...(Options.bridge === undefined ? {} : { bridge: Options.bridge }),
		Info,
		Warn,
	};
};

/** A fake client ctx for the BUILT bundle's apply (the bundle is CJS, so it
 *  cannot reuse the ESM Harness client plugin instance); every seam
 *  records. */
const BundleContext = (): any => {
	const Effects: string[] = [];
	const Injects: Record<string, Array<() => unknown>> = {};
	const Registered: any[] = [];
	const Ctx: any = {
		get: () => undefined,
		logger: { info: () => undefined, warn: () => undefined, error: () => undefined, debug: () => undefined },
		locale: { register: () => () => true },
		slots: {
			inject: (Slot: string, Factory: () => unknown) => {
				Injects[Slot] = [...(Injects[Slot] ?? []), Factory];
				return () => true;
			},
			register: (Registration: any, Component: unknown) => {
				Registered.push({ options: Registration, component: Component });
				return () => true;
			},
		},
		effect: (Setup: () => unknown, Label?: string) => {
			Effects.push(Label ?? "unnamed");
			Setup();
			return () => true;
		},
		reflect: { provide: () => () => true },
	};
	return { Ctx, Effects, Injects, Registered };
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// B1: the full thirteen-manifest roster table.
	{
		Check(Count, "B1: the thirteen shipped manifests are the exact roster", () => {
			assert.deepEqual(
				Roster.map((Adapter: any) => [
					Adapter.id,
					Adapter.bundle,
					Adapter.namespace,
					Adapter.order,
					Adapter.slot,
				]),
				[
					["adapter-hook-dsh-normalize-dash", "@playform/hook-dsh-normalize-dash", "hook-dsh-normalize-dash", 10, "playform.panel.section"],
					["adapter-hook-dsh-tool-coach", "@playform/hook-dsh-tool-coach", "hook-dsh-tool-coach", 30, "playform.panel.section"],
					["adapter-hook-dsh-convention-suggester", "@playform/hook-dsh-convention-suggester", "hook-dsh-convention-suggester", 40, "playform.panel.section"],
					["adapter-hook-dsh-normalize-quotes", "@playform/hook-dsh-normalize-quotes", "hook-dsh-normalize-quotes", 11, "playform.panel.section"],
					["adapter-hook-dsh-normalize-ellipsis", "@playform/hook-dsh-normalize-ellipsis", "hook-dsh-normalize-ellipsis", 12, "playform.panel.section"],
					["adapter-hook-dsh-normalize-spaces", "@playform/hook-dsh-normalize-spaces", "hook-dsh-normalize-spaces", 13, "playform.panel.section"],
					["adapter-hook-dsh-normalize-invisible", "@playform/hook-dsh-normalize-invisible", "hook-dsh-normalize-invisible", 14, "playform.panel.section"],
					["adapter-hook-dsh-normalize-fullwidth", "@playform/hook-dsh-normalize-fullwidth", "hook-dsh-normalize-fullwidth", 15, "playform.panel.section"],
					["adapter-plugin-dsh-normalize-file", "@playform/plugin-dsh-normalize-file", "plugin-dsh-normalize-file", 20, "playform.panel.section"],
					["adapter-hook-dsh-package-governor", "@playform/hook-dsh-package-governor", "hook-dsh-package-governor", 50, "playform.panel.section"],
					["adapter-hook-dsh-package-pinner", "@playform/hook-dsh-package-pinner", "hook-dsh-package-pinner", 55, "playform.panel.section"],
					["adapter-hook-dsh-cargo-governor", "@playform/hook-dsh-cargo-governor", "hook-dsh-cargo-governor", 60, "playform.panel.section"],
					["adapter-hook-dsh-ccr", "@playform/hook-dsh-ccr", "hook-dsh-ccr", 70, "playform.panel.section"],
				],
			);
		});
	}

	// B2/B3/B4: the wiring and the static vocabulary.
	{
		const Run = Make();
		const EffectLabels = Run.Effects.filter((Label: string) =>
			Label.startsWith("panel: adapter "),
		);
		Check(Count, "B2: the client apply wires exactly thirteen adapter effects", () => {
			assert.equal(EffectLabels.length, 13);
			assert.deepEqual(
				EffectLabels,
				Roster.map((Adapter: any) => `panel: adapter ${Adapter.id}`),
			);
		});
		const Records = Run.OpenSlot("playform.panel.section");
		Check(Count, "B3: the thirteen adapters register one section child each", () => {
			assert.equal((Run.Injects["playform.panel.section"] ?? []).length, 13);
			assert.equal(Run.Injects["playform.panel.overlay"], undefined);
			assert.deepEqual(
				Records.map((Record: any) => [Record.options.id, Record.options.order]),
				Roster.map((Adapter: any) => [Adapter.id, Adapter.order]),
			);
		});
		Check(Count, "B4: every manifest is enabled and follows the three D5 names", () => {
			for (const Adapter of Roster) {
				assert.equal(Adapter.activation, "enabled");
				assert.deepEqual(Adapter.traceKinds, [
					"observe/stamp",
					"graph/indexed",
					"graph/invalidated",
				]);
			}
		});
	}

	// B5: the volatile representatives of the ten new adapters' forms.
	{
		const Representatives: [string, string[]][] = [
			["hook-dsh-normalize-quotes", ["logFile", "log", "scopes.conversation", "toolResultsExempt"]],
			["hook-dsh-normalize-ellipsis", ["logFile", "replacement", "log", "scopes.conversation", "toolResultsExempt"]],
			["hook-dsh-normalize-spaces", ["replacement", "logFile"]],
			["hook-dsh-normalize-invisible", ["replacement"]],
			["hook-dsh-normalize-fullwidth", ["logFile", "toolResultsExempt"]],
			["plugin-dsh-normalize-file", ["replacement", "logFile", "toolResultsExempt"]],
			["hook-dsh-package-governor", ["updateCooldownMs", "mutationTools", "logFile"]],
			["hook-dsh-package-pinner", ["updateCooldownMs", "mutationTools"]],
			["hook-dsh-cargo-governor", ["updateCooldownMs", "mutationTools"]],
			["hook-dsh-ccr", ["thresholdBytes", "multipliers.error", "previewMaxChars", "logFile"]],
		];
		Check(Count, "B5: each new adapter's form derives its volatile fields", () => {
			for (const [Namespace, VolatileLabels] of Representatives) {
				const Section = NewAdapterFor(Namespace);
				const FormView = Derived(Section, Views.find((Entry) => Entry.ns === Namespace));
				assert.equal(FormView.namespace, Namespace);
				assert.equal(FormView.status, "ready");
				assert.equal(FormView.secret, false);
				for (const Label of VolatileLabels) {
					const Field = FieldNamed(FormView, Label);
					assert.notEqual(Field, undefined, `${Namespace}: ${Label} missing`);
					assert.equal(Field.volatile, true, `${Namespace}: ${Label} not volatile`);
				}
			}
		});
	}

	// B6: the plain representatives + the all-volatile file flavor.
	{
		const Representatives: [string, string[]][] = [
			["hook-dsh-normalize-quotes", ["normalizeReasoning", "normalizeToolArguments"]],
			["hook-dsh-normalize-ellipsis", ["normalizeReasoning", "normalizeToolArguments"]],
			["hook-dsh-normalize-spaces", ["normalizeReasoning", "normalizeToolArguments"]],
			["hook-dsh-normalize-invisible", ["normalizeReasoning", "normalizeToolArguments"]],
			["hook-dsh-normalize-fullwidth", ["normalizeReasoning", "normalizeToolArguments"]],
			["hook-dsh-package-governor", ["strict", "maxUpdateFailures", "updateMode", "ncuBin"]],
			["hook-dsh-package-pinner", ["sections", "policyFile", "exclude"]],
			["hook-dsh-cargo-governor", ["strict", "maxUpdateFailures", "cargoBin", "keepFile", "updateMode"]],
			["hook-dsh-ccr", ["targets", "exempt", "autoExpand", "ttlSeconds", "contextEngine"]],
		];
		Check(Count, "B6: the plain representatives and the all-volatile file flavor", () => {
			for (const [Namespace, PlainLabels] of Representatives) {
				const Section = NewAdapterFor(Namespace);
				const FormView = Derived(Section, Views.find((Entry) => Entry.ns === Namespace));
				for (const Label of PlainLabels) {
					const Field = FieldNamed(FormView, Label);
					assert.notEqual(Field, undefined, `${Namespace}: ${Label} missing`);
					assert.equal(Field.volatile, false, `${Namespace}: ${Label} not plain`);
				}
			}
			const FileForm = Derived(
				NewAdapterFor("plugin-dsh-normalize-file"),
				Views.find((Entry) => Entry.ns === "plugin-dsh-normalize-file"),
			);
			assert.equal(FileForm.fields.length > 0, true);
			for (const Field of FileForm.fields) {
				assert.equal(Field.volatile, true, `plugin-dsh-normalize-file: ${Field.label} not volatile`);
			}
		});
	}

	// B7/B8: the two write routes on the new adapters.
	{
		const CcrView = Views.find((Entry) => Entry.ns === "hook-dsh-ccr");
		const CcrForm = Derived(Ccr, CcrView);
		const Forms = MakeForms(Views);
		const PortsWithForms = Ports({ configForms: Forms.Forms });
		const Threshold = FieldNamed(CcrForm, "thresholdBytes");
		const Accepted = await Apply(PortsWithForms, Ccr, CcrForm, Threshold, 4096);
		Check(Count, "B7: a ccr volatile write rides the revision-fenced mutate", () => {
			assert.equal(Accepted, true);
			assert.deepEqual(Forms.Mutations, [
				{
					namespace: "hook-dsh-ccr",
					ops: [{ op: "set", path: ["thresholdBytes"], value: 4096 }],
					revision: 9,
				},
			]);
		});
		const GovernorView = Views.find((Entry) => Entry.ns === "hook-dsh-package-governor");
		const GovernorForm = Derived(PackageGovernor, GovernorView);
		const Bridged = MakeBridge();
		const PortsWithBridge = Ports({
			configForms: MakeForms(Views).Forms,
			bridge: Bridged.Bridge,
		});
		const Strict = FieldNamed(GovernorForm, "strict");
		const PlainAccepted = await Apply(
			PortsWithBridge,
			PackageGovernor,
			GovernorForm,
			Strict,
			true,
		);
		Check(Count, "B8: a governor plain write rides the bridge with the audit line", () => {
			assert.equal(PlainAccepted, true);
			assert.deepEqual(Bridged.Writes[0].namespace, "hook-dsh-package-governor");
			assert.equal(Bridged.Writes[0].patch.strict, true);
			assert.deepEqual(PortsWithBridge.Info, [
				"client-dsh-panel-family: plain-field write hook-dsh-package-governor strict",
			]);
		});
	}

	// B9: the built closure-factory bundle through the fake module loader.
	{
		Check(Count, "B9: the built bundle executes and registers the thirteen adapters", () => {
			const Code = BundleSource();
			assert.equal(Code.includes("window.__ModuleLoader__.load({"), true);
			const Rows: any[] = [];
			const Window = {
				__ModuleLoader__: { load: (Row: any) => Rows.push(Row) },
			};
			new Function("window", Code)(Window);
			assert.equal(Rows.length, 1);
			assert.equal(Rows[0].id, "@playform/client-dsh-panel-family");
			assert.equal(typeof Rows[0].factory, "function");
			const Exports = Rows[0].factory((Name: string) => {
				assert.equal(Name, "react");
				return React;
			});
			assert.deepEqual(Exports.inject, ["slots", "locale"]);
			assert.equal(typeof Exports.apply, "function");
			assert.deepEqual(Exports.default.inject, ["slots", "locale"]);
			const Recorded = BundleContext();
			Exports.apply(Recorded.Ctx);
			assert.equal(
				Recorded.Effects.filter((Label: string) => Label.startsWith("panel: adapter "))
					.length,
				13,
			);
			const Factories = Recorded.Injects["playform.panel.section"] ?? [];
			assert.equal(Factories.length, 13);
			for (const Factory of Factories) Factory();
			assert.equal(Recorded.Registered.length, 13);
			assert.equal(typeof Recorded.Registered[0].component, "function");
		});
	}

	return Finish(Count, "All-Adapters");
};

// Standalone entry: `node Target/Test/All-Adapters/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - All-Adapters`);
}
