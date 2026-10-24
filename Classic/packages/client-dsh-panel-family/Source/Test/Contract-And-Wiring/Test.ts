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
			assert.deepEqual(Run.Effects, [
				"panel: dictionaries",
				"panel: trace source",
				"panel: family tab",
				"panel: overlay mount",
				"panel: adapter adapter-hook-dsh-normalize-dash",
				"panel: adapter adapter-hook-dsh-tool-coach",
				"panel: adapter adapter-hook-dsh-convention-suggester",
				"panel: adapter adapter-hook-dsh-normalize-quotes",
				"panel: adapter adapter-hook-dsh-normalize-ellipsis",
				"panel: adapter adapter-hook-dsh-normalize-spaces",
				"panel: adapter adapter-hook-dsh-normalize-invisible",
				"panel: adapter adapter-hook-dsh-normalize-fullwidth",
				"panel: adapter adapter-plugin-dsh-normalize-file",
				"panel: adapter adapter-hook-dsh-package-governor",
				"panel: adapter adapter-hook-dsh-package-pinner",
				"panel: adapter adapter-hook-dsh-cargo-governor",
				"panel: adapter adapter-hook-dsh-ccr",
			]);
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
							normalize: "Normalize family",
							"tool-coach": "Tool coach",
							suggester: "Convention suggester",
							"normalize-quotes": "Normalize quotes",
							"normalize-ellipsis": "Normalize ellipsis",
							"normalize-spaces": "Normalize spaces",
							"normalize-invisible": "Normalize invisible characters",
							"normalize-fullwidth": "Normalize fullwidth characters",
							"normalize-file": "Normalize file contents",
							"package-governor": "Package governor",
							"package-pinner": "Package pinner",
							"cargo-governor": "Cargo governor",
							ccr: "Tool output compression",
							"status.enabled": "Enabled",
							"status.disabled": "Disabled",
							"status.unknown": "Unknown",
							"status.live": "Live trace",
							"status.static": "Static status",
							"status.tail": "Recent events",
							"form.options": "Options",
							"form.volatile": "applies live",
							"form.plain": "applies on remount",
							"form.bridge-missing": "plain-field bridge unavailable",
							"form.secret": "configured (secret)",
							"form.secret-namespace": "read-only (the namespace has secrets)",
							"form.loading": "Loading the configuration...",
							"form.unavailable": "Configuration forms are not composed.",
							"form.empty": "This plugin exposes no configurable fields.",
							"form.overridden": "user override",
						},
						zh: {
							tab: "家族",
							empty: "尚未注册任何家族板块。",
							overlay: "家族面板",
							close: "关闭",
							normalize: "规范化家族",
							"tool-coach": "工具教练",
							suggester: "约定建议器",
							"normalize-quotes": "规范引号",
							"normalize-ellipsis": "规范省略号",
							"normalize-spaces": "规范空格",
							"normalize-invisible": "规范不可见字符",
							"normalize-fullwidth": "规范全角字符",
							"normalize-file": "规范文件内容",
							"package-governor": "软件包治理器",
							"package-pinner": "依赖版本固定器",
							"cargo-governor": "Cargo 治理器",
							ccr: "工具输出压缩",
							"status.enabled": "已启用",
							"status.disabled": "已停用",
							"status.unknown": "未知",
							"status.live": "实时跟踪",
							"status.static": "静态状态",
							"status.tail": "最近事件",
							"form.options": "选项",
							"form.volatile": "实时生效",
							"form.plain": "重新加载后生效",
							"form.bridge-missing": "明文字段桥不可用",
							"form.secret": "已配置(机密)",
							"form.secret-namespace": "只读(命名空间含机密)",
							"form.loading": "正在加载配置...",
							"form.unavailable": "未组合配置表单。",
							"form.empty": "该插件没有可配置字段。",
							"form.overridden": "用户覆盖",
						},
					},
				},
			]);
		});
		Check(Count, "C8: the two mounts and the child slot are injected on their exact slots", () => {
			assert.deepEqual(Object.keys(Run.Injects), [
				"conversation.view",
				"shell.overlay",
				"playform.panel.section",
			]);
		});
	}

	// Group C9-C10: the tab renderer registration (the slot contract).
	{
		const Run = Make();
		const [TabRecord] = Run.OpenSlot("conversation.view");
		Check(Count, "C9: the family tab registers with the exact options and child slot", () => {
			assert.deepEqual(
				{ ...TabRecord.options, label: undefined },
				{
					name: "conversation.view",
					id: "playform-family",
					order: 20,
					locale: "client-dsh-panel-family",
					label: undefined,
					children: {
						"playform.panel.section": { kind: "list", scope: "session" },
					},
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
		Check(Count, "C11: the overlay mount registers with the exact options and child slot", () => {
			assert.deepEqual(
				{ ...OverlayRecord.options, label: undefined },
				{
					name: "shell.overlay",
					id: "playform-family-overlay",
					locale: "client-dsh-panel-family",
					label: undefined,
					children: {
						"playform.panel.overlay": { kind: "list", scope: "root" },
					},
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
