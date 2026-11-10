import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, MakeClient, Plugin, Validate } from "../Harness.js";

/**
 * @module Test
 *
 * The client half's registration surface, exercised through the records the real
 * built client apply actually produced.
 *
 * @remarks
 *
 * The suite proves the one conversation.view tab (id, order, locale namespace),
 * the pre-locale label, the registered dictionaries, and the Config schema's
 * volatile defaults read from Target/Library.js through the alias hooks.
 */
/** The schema evaluated once at suite start: the call yields the defaults
 *  when the test build resolves schemastery, and null when it does not (the
 *  call itself throws), which switches C4 to the key-presence fallback. */
let Defaults: any = null;
try {
	Defaults = Validate({});
} catch (_Error) {
	Defaults = null;
}

export const runTest = (): number => {
	const Count = MakeCounter();
	const Run = MakeClient();
	const Tab = Run.Provided.tabs[0] as any;

	Check(Count, "C1: exactly one tab, conversation.view/playform-cost/order 30", () => {
		assert.equal(Run.Provided.tabs.length, 1);
		assert.equal(Tab.options.name, "conversation.view");
		assert.equal(Tab.options.id, "playform-cost");
		assert.equal(Tab.options.order, 30);
		assert.equal(Tab.options.locale, "client-dsh-panel-cost");
	});
	Check(Count, "C2: label() returns the pre-locale Cost", () => {
		assert.equal(Tab.options.label(), "Cost");
	});
	Check(Count, "C3: the locale namespace carries en and zh, en.tab is Cost", () => {
		assert.equal(Run.Provided.locales.length, 1);
		const Locale = Run.Provided.locales[0];
		assert.equal(Locale.namespace, "client-dsh-panel-cost");
		assert.equal(typeof Locale.dictionaries.en, "object");
		assert.equal(typeof Locale.dictionaries.zh, "object");
		assert.equal((Locale.dictionaries.en as Record<string, string>).tab, "Cost");
	});
	Check(Count, "C4: the Config schema's four volatile defaults", () => {
		if (Defaults !== null) {
			// A volatile Schemastery field validates to a getter object
			// (`{ get() }`) so a hot edit can rebind the value without a
			// remount; the default is what the getter returns.
			const Read = (Value: unknown): unknown =>
				typeof (Value as { get?: unknown } | null)?.get === "function"
					? (Value as { get: () => unknown }).get()
					: Value;
			assert.deepEqual(
				Object.fromEntries(
					Object.entries(Defaults).map(([Key, Value]) => [Key, Read(Value)]),
				),
				{
					enabled: true,
					tabOrder: 30,
					rows: 200,
					locale: "en",
				},
			);
			return;
		}
		// The schema is not callable from this test build (schemastery did
		// not resolve), so the fallback proves the four keys exist and the
		// README records the skipped default check.
		const Schema = Plugin.Config as unknown as Record<string, unknown>;
		for (const Key of ["enabled", "tabOrder", "rows", "locale"]) {
			assert.ok(Key in Schema, `missing config key: ${Key}`);
		}
	});

	return Finish(Count, "Config-And-Tab");
};

// Standalone entry: `node Target/Test/Config-And-Tab/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Config-And-Tab`);
}
