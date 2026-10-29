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
        "panel: adapter adapter-hook-dsh-ccr"
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
              "form.overridden": "user override"
            },
            zh: {
              tab: "\u5BB6\u65CF",
              empty: "\u5C1A\u672A\u6CE8\u518C\u4EFB\u4F55\u5BB6\u65CF\u677F\u5757\u3002",
              overlay: "\u5BB6\u65CF\u9762\u677F",
              close: "\u5173\u95ED",
              normalize: "\u89C4\u8303\u5316\u5BB6\u65CF",
              "tool-coach": "\u5DE5\u5177\u6559\u7EC3",
              suggester: "\u7EA6\u5B9A\u5EFA\u8BAE\u5668",
              "normalize-quotes": "\u89C4\u8303\u5F15\u53F7",
              "normalize-ellipsis": "\u89C4\u8303\u7701\u7565\u53F7",
              "normalize-spaces": "\u89C4\u8303\u7A7A\u683C",
              "normalize-invisible": "\u89C4\u8303\u4E0D\u53EF\u89C1\u5B57\u7B26",
              "normalize-fullwidth": "\u89C4\u8303\u5168\u89D2\u5B57\u7B26",
              "normalize-file": "\u89C4\u8303\u6587\u4EF6\u5185\u5BB9",
              "package-governor": "\u8F6F\u4EF6\u5305\u6CBB\u7406\u5668",
              "package-pinner": "\u4F9D\u8D56\u7248\u672C\u56FA\u5B9A\u5668",
              "cargo-governor": "Cargo \u6CBB\u7406\u5668",
              ccr: "\u5DE5\u5177\u8F93\u51FA\u538B\u7F29",
              "status.enabled": "\u5DF2\u542F\u7528",
              "status.disabled": "\u5DF2\u505C\u7528",
              "status.unknown": "\u672A\u77E5",
              "status.live": "\u5B9E\u65F6\u8DDF\u8E2A",
              "status.static": "\u9759\u6001\u72B6\u6001",
              "status.tail": "\u6700\u8FD1\u4E8B\u4EF6",
              "form.options": "\u9009\u9879",
              "form.volatile": "\u5B9E\u65F6\u751F\u6548",
              "form.plain": "\u91CD\u65B0\u52A0\u8F7D\u540E\u751F\u6548",
              "form.bridge-missing": "\u660E\u6587\u5B57\u6BB5\u6865\u4E0D\u53EF\u7528",
              "form.secret": "\u5DF2\u914D\u7F6E(\u673A\u5BC6)",
              "form.secret-namespace": "\u53EA\u8BFB(\u547D\u540D\u7A7A\u95F4\u542B\u673A\u5BC6)",
              "form.loading": "\u6B63\u5728\u52A0\u8F7D\u914D\u7F6E...",
              "form.unavailable": "\u672A\u7EC4\u5408\u914D\u7F6E\u8868\u5355\u3002",
              "form.empty": "\u8BE5\u63D2\u4EF6\u6CA1\u6709\u53EF\u914D\u7F6E\u5B57\u6BB5\u3002",
              "form.overridden": "\u7528\u6237\u8986\u76D6"
            }
          }
        }
      ]);
    });
    Check(Count, "C8: the two mounts and the child slot are injected on their exact slots", () => {
      assert.deepEqual(Object.keys(Run.Injects), [
        "conversation.view",
        "shell.overlay",
        "playform.panel.section"
      ]);
    });
  }
  {
    const Run = Make();
    const [TabRecord] = Run.OpenSlot("conversation.view");
    Check(Count, "C9: the family tab registers with the exact options and child slot", () => {
      assert.deepEqual(
        { ...TabRecord.options, label: void 0 },
        {
          name: "conversation.view",
          id: "playform-family",
          order: 20,
          locale: "client-dsh-panel-family",
          label: void 0,
          children: {
            "playform.panel.section": { kind: "list", scope: "session" }
          }
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
    Check(Count, "C11: the overlay mount registers with the exact options and child slot", () => {
      assert.deepEqual(
        { ...OverlayRecord.options, label: void 0 },
        {
          name: "shell.overlay",
          id: "playform-family-overlay",
          locale: "client-dsh-panel-family",
          label: void 0,
          children: {
            "playform.panel.overlay": { kind: "list", scope: "root" }
          }
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
