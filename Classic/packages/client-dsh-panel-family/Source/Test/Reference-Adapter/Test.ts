// Source/Test/Reference-Adapter/Test.ts - one REFERENCE ADAPTER end to end,
// against the real built functions and the real manifest the package ships:
// the STATUS (the static fallback, the live trace tail, the activation
// override), the CONFIG FORM generated from the plugin's serialized
// Schemastery schema (the volatile/plain/secret classification, defaults,
// provenance, enum options, nested object fields), and the two write routes
// (the revision-fenced volatile mutate, the plain-field bridge with its audit
// line, the secret-namespace and missing-bridge refusals). The three shipped
// manifests and their adapter effects close the roster.
import assert from "node:assert/strict";
import Schema from "@deepseek-ai/schemastery";
import {
	Check,
	Finish,
	Make,
	MakeBridge,
	MakeCounter,
	MakeForms,
	MakeTrace,
} from "../Harness.js";

// The built modules load AFTER the Harness registered the alias hooks (a
// static import would link before the hooks exist, the same reason the
// Harness imports the Target dynamically).
const Apply = (await import("@Function/Apply.js")).default;
const Bridge = (await import("@Function/Bridge.js")).default;
const Field = (await import("@Function/Field.js")).default;
const Form = (await import("@Function/Form.js")).default;
const Live = (await import("@Function/Live.js")).default;
const Status = (await import("@Function/Status.js")).default;
const Normalize = (await import("@Variable/Reference/Normalize.js")).default;
const Suggester = (await import("@Variable/Reference/Suggester.js")).default;
const ToolCoach = (await import("@Variable/Reference/ToolCoach.js")).default;

// The normalize family's schema shape (the volatile knobs, the two plain
// semantic gates, the volatile scopes object, the volatile exemption list).
const NormalizeSchema = Schema.object({
	logFile: Schema.string()
		.default("~/.dsh/playform/hook-dsh-normalize-dash.log")
		.volatile(),
	replacement: Schema.string().default("-").volatile(),
	normalizeReasoning: Schema.boolean().default(true),
	normalizeToolArguments: Schema.boolean().default(false),
	scopes: Schema.object({
		conversation: Schema.boolean().default(true),
		reasoning: Schema.boolean().default(true),
	}).volatile(),
	toolResultsExempt: Schema.array(Schema.string()).default(["read"]).volatile(),
});

const NormalizeView = {
	ns: "hook-dsh-normalize-dash",
	schema: NormalizeSchema.toJSON(),
	value: {
		logFile: "~/.dsh/playform/hook-dsh-normalize-dash.log",
		replacement: "~",
		normalizeReasoning: false,
		normalizeToolArguments: true,
		scopes: { conversation: true, reasoning: false },
		toolResultsExempt: ["read", "edit"],
	},
	base: { replacement: "-", normalizeReasoning: true },
	user: { replacement: "~", normalizeReasoning: false },
	revision: 7,
};

// The coach's schema shape: every knob volatile (the v4.1 plan's first form).
const CoachSchema = Schema.object({
	enabled: Schema.boolean().default(true).volatile(),
	threshold: Schema.number().default(3).volatile(),
	enforce: Schema.union(["off", "write", "all"]).default("off").volatile(),
});

const CoachView = {
	ns: "hook-dsh-tool-coach",
	schema: CoachSchema.toJSON(),
	value: { enabled: true, threshold: 3, enforce: "off" },
	revision: 4,
};

// A namespace that declares a secret: its plain fields are read-only and a
// bridge write is refused (the redacted value must never be restated).
const SecretSchema = Schema.object({
	token: Schema.string().role("secret"),
	label: Schema.string().default("x"),
});

const SecretView = {
	ns: "hook-dsh-secret-test",
	schema: SecretSchema.toJSON(),
	value: { token: "hunter2", label: "x" },
	revision: 2,
};

const EmptyLive = () => Live(undefined, []);

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
		live: Options.live ?? EmptyLive(),
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

const Derived = (Section: any, View: any, BridgeExposed = true): any =>
	Form(Section, {
		view: View,
		writable: true,
		available: true,
		bridge: BridgeExposed,
	});

const FieldNamed = (View: any, Label: string): any =>
	View.fields.find((Entry: any) => Entry.label === Label);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// A1/A2/A3/A4: the status - static, live, newest first, the override.
	{
		Check(Count, "A1: without a trace the status is the static activation", () => {
			assert.deepEqual(Status(Normalize, undefined), {
				bundle: "@playform/hook-dsh-normalize-dash",
				activation: "enabled",
				live: false,
				tail: [],
			});
		});
		const Trace = MakeTrace();
		const Tail = Live(Trace, ["observe/stamp", "graph/indexed", "graph/invalidated"]);
		Trace.emit("observe/stamp", { path: "src/a.ts" });
		Check(Count, "A2: an exposed trace makes the status live and fills the tail", () => {
			assert.deepEqual(Status(Normalize, Tail), {
				bundle: "@playform/hook-dsh-normalize-dash",
				activation: "enabled",
				live: true,
				tail: ["observe/stamp src/a.ts"],
			});
		});
		Trace.emit("graph/indexed", { path: "src/b.ts" });
		Trace.emit("graph/invalidated", { path: "src/c.ts" });
		Check(Count, "A3: the tail is newest first and byte-exact", () => {
			assert.deepEqual(Status(Normalize, Tail).tail, [
				"graph/invalidated src/c.ts",
				"graph/indexed src/b.ts",
				"observe/stamp src/a.ts",
			]);
		});
		Check(Count, "A3b: a late-attached trace seeds the tail from its ring", () => {
			const Late = Live(Trace, [
				"observe/stamp",
				"graph/indexed",
				"graph/invalidated",
			]);
			assert.deepEqual(Status(Normalize, Late).tail, [
				"graph/invalidated src/c.ts",
				"graph/indexed src/b.ts",
				"observe/stamp src/a.ts",
			]);
		});
		Trace.emit("graph/indexed", { path: "src/d.ts", activation: "disabled" });
		Check(Count, "A4: the newest activation override wins", () => {
			assert.equal(Status(Normalize, Tail).activation, "disabled");
			Trace.emit("graph/indexed", { path: "src/e.ts", activation: "enabled" });
			assert.equal(Status(Normalize, Tail).activation, "enabled");
		});
	}

	// A5: the config form generated from the plugin's schema.
	{
		const View = Derived(Normalize, NormalizeView);
		Check(Count, "A5: the form derives every field from the serialized schema", () => {
			assert.equal(View.namespace, "hook-dsh-normalize-dash");
			assert.equal(View.status, "ready");
			assert.equal(View.writable, true);
			assert.equal(View.bridge, true);
			assert.equal(View.secret, false);
			assert.equal(View.revision, 7);
			assert.deepEqual(
				View.fields.map((Entry: any) => ({
					label: Entry.label,
					type: Entry.type,
					volatile: Entry.volatile,
					secret: Entry.secret,
					overridden: Entry.overridden,
				})),
				[
					{ label: "logFile", type: "string", volatile: true, secret: false, overridden: false },
					{ label: "replacement", type: "string", volatile: true, secret: false, overridden: true },
					{ label: "normalizeReasoning", type: "boolean", volatile: false, secret: false, overridden: true },
					{ label: "normalizeToolArguments", type: "boolean", volatile: false, secret: false, overridden: false },
					{ label: "scopes.conversation", type: "boolean", volatile: true, secret: false, overridden: false },
					{ label: "scopes.reasoning", type: "boolean", volatile: true, secret: false, overridden: false },
					{ label: "toolResultsExempt", type: "array", volatile: true, secret: false, overridden: false },
				],
			);
			const Replacement = FieldNamed(View, "replacement");
			assert.equal(Replacement.value, "~");
			assert.equal(Replacement.base, "-");
			assert.deepEqual(Replacement.path, ["replacement"]);
			assert.equal(FieldNamed(View, "normalizeReasoning").value, false);
			assert.equal(FieldNamed(View, "normalizeReasoning").base, true);
			assert.deepEqual(FieldNamed(View, "toolResultsExempt").value, ["read", "edit"]);
		});
		Check(Count, "A5b: the form reports the unavailable and loading states", () => {
			assert.equal(
				Form(Normalize, { writable: false, available: false, bridge: false }).status,
				"unavailable",
			);
			assert.equal(
				Form(Normalize, { writable: false, available: true, bridge: false }).status,
				"loading",
			);
		});
	}

	// A6: a secret field renders the marker, never the value.
	{
		const View = Derived(Normalize, SecretView);
		const Secret = FieldNamed(View, "token");
		const Element = Field({
			field: Secret,
			view: View,
			section: Normalize,
			ports: Ports(),
		}) as any;
		Check(Count, "A6: a secret field renders the marker and never the value", () => {
			assert.equal(View.secret, true);
			assert.equal(Secret.secret, true);
			assert.equal(Element.type, "label");
			const Children = Element.props.children as any[];
			const SecretSpan = Children.find(
				(Child: any) => Child?.props?.className === "playform-family-field-secret",
			);
			assert.equal(SecretSpan.props.children, "configured (secret)");
			assert.equal(JSON.stringify(Element).includes("hunter2"), false);
		});
	}

	// A7: a volatile field writes through the revision-fenced mutate.
	{
		const View = Derived(ToolCoach, CoachView);
		const Enabled = FieldNamed(View, "enabled");
		const Forms = MakeForms([CoachView, NormalizeView, SecretView]);
		const PortsWithForms = Ports({ configForms: Forms.Forms });
		const Accepted = await Apply(PortsWithForms, ToolCoach, View, Enabled, false);
		Check(Count, "A7: a volatile write rides the revision-fenced mutate", () => {
			assert.equal(Accepted, true);
			assert.deepEqual(Forms.Mutations, [
				{
					namespace: "hook-dsh-tool-coach",
					ops: [{ op: "set", path: ["enabled"], value: false }],
					revision: 4,
				},
			]);
			assert.deepEqual(PortsWithForms.Info, []);
			assert.deepEqual(PortsWithForms.Warn, []);
			assert.equal(FieldNamed(View, "enforce").options.join(","), "off,write,all");
		});
	}

	// A8/A9/A10: the plain-field bridge - the write, the two refusals.
	{
		const View = Derived(Normalize, NormalizeView);
		const Plain = FieldNamed(View, "normalizeReasoning");
		const Forms = MakeForms([NormalizeView, SecretView]);
		const Bridged = MakeBridge();
		const PortsWithBridge = Ports({
			configForms: Forms.Forms,
			bridge: Bridged.Bridge,
		});
		const Accepted = await Apply(PortsWithBridge, Normalize, View, Plain, true);
		Check(Count, "A8: a plain write sends the whole config through the bridge", () => {
			assert.equal(Accepted, true);
			assert.deepEqual(Bridged.Writes, [
				{
					namespace: "hook-dsh-normalize-dash",
					patch: {
						logFile: "~/.dsh/playform/hook-dsh-normalize-dash.log",
						replacement: "~",
						normalizeReasoning: true,
						normalizeToolArguments: true,
						scopes: { conversation: true, reasoning: false },
						toolResultsExempt: ["read", "edit"],
					},
				},
			]);
			assert.deepEqual(PortsWithBridge.Info, [
				"client-dsh-panel-family: plain-field write hook-dsh-normalize-dash normalizeReasoning",
			]);
		});
		const SecretForm = Derived(Normalize, SecretView);
		const SecretSection = { ...Normalize, namespace: "hook-dsh-secret-test" };
		const SecretPlain = FieldNamed(SecretForm, "label");
		const Refused = await Apply(
			PortsWithBridge,
			SecretSection,
			SecretForm,
			SecretPlain,
			"y",
		);
		Check(Count, "A9: a secret namespace refuses the bridge write", () => {
			assert.equal(Refused, false);
			assert.equal(Bridged.Writes.length, 1);
			assert.equal(PortsWithBridge.Warn[0], "client-dsh-panel-family: plain-field secret refused for hook-dsh-secret-test");
		});
		const Bare = Ports({ configForms: Forms.Forms });
		const Missing = await Apply(Bare, Normalize, View, Plain, true);
		Check(Count, "A10: a missing bridge refuses with the documented line", () => {
			assert.equal(Missing, false);
			assert.deepEqual(Bare.Warn, [
				"client-dsh-panel-family: plain-field bridge unavailable for hook-dsh-normalize-dash",
			]);
		});
	}

	// A11: the bridge resolution order.
	{
		const Direct = MakeBridge();
		const Remote = MakeBridge();
		Check(Count, "A11: the bridge resolves direct first, then the gateway face", () => {
			assert.equal(Bridge(Make({ bridge: Direct.Bridge }).Ctx), Direct.Bridge);
			assert.equal(
				Bridge(Make({ remote: { playformFamilyPanel: Remote.Bridge } }).Ctx),
				Remote.Bridge,
			);
			assert.equal(Bridge(Make().Ctx), undefined);
		});
	}

	// A12: the reference roster and its adapter effects.
	{
		const Run = Make();
		Check(Count, "A12: the three reference adapters lead the shipped roster", () => {
			assert.deepEqual(
				[Normalize, ToolCoach, Suggester].map((Adapter: any) => [
					Adapter.id,
					Adapter.bundle,
					Adapter.namespace,
					Adapter.order,
					Adapter.slot,
				]),
				[
					[
						"adapter-hook-dsh-normalize-dash",
						"@playform/hook-dsh-normalize-dash",
						"hook-dsh-normalize-dash",
						10,
						"playform.panel.section",
					],
					[
						"adapter-hook-dsh-tool-coach",
						"@playform/hook-dsh-tool-coach",
						"hook-dsh-tool-coach",
						30,
						"playform.panel.section",
					],
					[
						"adapter-hook-dsh-convention-suggester",
						"@playform/hook-dsh-convention-suggester",
						"hook-dsh-convention-suggester",
						40,
						"playform.panel.section",
					],
				],
			);
			// The ten residual adapters append after the three references; the
			// first three effect labels stay the references' own.
			assert.deepEqual(
				Run.Effects.filter((Label: string) => Label.startsWith("panel: adapter ")).slice(0, 3),
				[
					"panel: adapter adapter-hook-dsh-normalize-dash",
					"panel: adapter adapter-hook-dsh-tool-coach",
					"panel: adapter adapter-hook-dsh-convention-suggester",
				],
			);
		});
	}

	return Finish(Count, "Reference-Adapter");
};

// Standalone entry: `node Target/Test/Reference-Adapter/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Reference-Adapter`);
}
