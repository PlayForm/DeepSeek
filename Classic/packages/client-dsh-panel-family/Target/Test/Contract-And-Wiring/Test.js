import assert from "node:assert/strict";
import {
  BuiltClientSource,
  Check,
  Finish,
  MakeCounter,
  Make,
  Plugin,
  ClientPlugin,
  Validate
} from "../Harness.js";
const runTest = () => {
  const Count = MakeCounter();
  Check(Count, "C1: the loader row carries name/apply/Config/inject", () => {
    assert.equal(Plugin.name, "client-dsh-panel-family");
    assert.equal(typeof Plugin.apply, "function");
    assert.equal(typeof Plugin.Config, "function");
    assert.deepEqual(Plugin.inject, []);
    assert.equal(Plugin.apply(), void 0);
    assert.deepEqual(Plugin, { name: Plugin.name, apply: Plugin.apply, Config: Plugin.Config, inject: [] });
  });
  Check(Count, "C2: the schema fills the exact defaults (volatile cells unwrap)", () => {
    const Value = Validate({});
    const Cell = (Key) => {
      const Field = Value[Key];
      return typeof Field?.get === "function" ? Field.get() : Field;
    };
    assert.deepEqual(
      {
        enabled: Cell("enabled"),
        tabOrder: Cell("tabOrder"),
        overlayMaxWidth: Cell("overlayMaxWidth"),
        locale: Cell("locale")
      },
      { enabled: true, tabOrder: 20, overlayMaxWidth: 720, locale: "en" }
    );
  });
  Check(Count, "C3: an invalid locale fails loud at load", () => {
    assert.throws(() => Validate({ locale: "fr" }));
  });
  {
    const Run = Make();
    Check(Count, "C4: the client half requires slots and locale", () => {
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
              close: "Close"
            },
            zh: {
              tab: "\u5BB6\u65CF",
              empty: "\u5C1A\u672A\u6CE8\u518C\u4EFB\u4F55\u5BB6\u65CF\u677F\u5757\u3002",
              overlay: "\u5BB6\u65CF\u9762\u677F",
              close: "\u5173\u95ED"
            }
          }
        }
      ]);
    });
    Check(Count, "C8: the two slot points are injected on their exact slots", () => {
      assert.deepEqual(Object.keys(Run.Injects), ["conversation.view", "shell.overlay"]);
    });
  }
  {
    const Run = Make();
    const [TabRecord] = Run.OpenSlot("conversation.view");
    Check(Count, "C9: the family tab registers with the exact options", () => {
      assert.deepEqual(
        { ...TabRecord.options, label: void 0 },
        {
          name: "conversation.view",
          id: "playform-family",
          order: 20,
          locale: "client-dsh-panel-family",
          label: void 0
        }
      );
      assert.equal(TabRecord.options.label(), "Family");
    });
    Check(Count, "C10: the tab component is the FamilyTab element bound to the registry", () => {
      const Element = TabRecord.component();
      assert.equal(typeof Element.type, "function");
      assert.equal(Element.props.registry, Run.Provided["playformFamilyPanel"]);
    });
    const [OverlayRecord] = Run.OpenSlot("shell.overlay");
    Check(Count, "C11: the overlay mount registers with the exact options", () => {
      assert.deepEqual(
        { ...OverlayRecord.options, label: void 0 },
        {
          name: "shell.overlay",
          id: "playform-family-overlay",
          locale: "client-dsh-panel-family",
          label: void 0
        }
      );
      assert.equal(OverlayRecord.options.label(), "Family panel");
    });
    Check(Count, "C12: the overlay component is the styled overlay container", () => {
      const Element = OverlayRecord.component();
      assert.equal(Element.type, "div");
      assert.equal(Element.props.className, "playform-family-overlay");
      assert.deepEqual(Element.props.style, { maxWidth: 720 });
    });
  }
  Check(Count, "C13: the built client touches no Node API and no fs", () => {
    const Source = BuiltClientSource();
    assert.equal(/node:/.test(Source), false);
    assert.equal(/require\(/.test(Source), false);
    assert.equal(/readFileSync|writeFileSync/.test(Source), false);
  });
  return Finish(Count, "Contract-And-Wiring");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = runTest();
  console.log(`${Pass} PASS - Contract-And-Wiring`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
