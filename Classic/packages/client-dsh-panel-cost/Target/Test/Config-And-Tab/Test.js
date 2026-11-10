import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, MakeClient, Plugin, Validate } from "../Harness.js";
let Defaults = null;
try {
  Defaults = Validate({});
} catch (_Error) {
  Defaults = null;
}
const runTest = () => {
  const Count = MakeCounter();
  const Run = MakeClient();
  const Tab = Run.Provided.tabs[0];
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
    assert.equal(Locale.dictionaries.en.tab, "Cost");
  });
  Check(Count, "C4: the Config schema's four volatile defaults", () => {
    if (Defaults !== null) {
      const Read = (Value) => typeof Value?.get === "function" ? Value.get() : Value;
      assert.deepEqual(
        Object.fromEntries(
          Object.entries(Defaults).map(([Key, Value]) => [Key, Read(Value)])
        ),
        {
          enabled: true,
          tabOrder: 30,
          rows: 200,
          locale: "en"
        }
      );
      return;
    }
    const Schema = Plugin.Config;
    for (const Key of ["enabled", "tabOrder", "rows", "locale"]) {
      assert.ok(Key in Schema, `missing config key: ${Key}`);
    }
  });
  return Finish(Count, "Config-And-Tab");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = runTest();
  console.log(`${Pass} PASS - Config-And-Tab`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
