import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make } from "../Harness.js";
const SECTION = "playform.panel.section";
const OVERLAY = "playform.panel.overlay";
const NAMESPACE = "client-dsh-panel-family";
const Adapter = (Id, Bundle, Order = 50, Slot = SECTION) => ({
  id: Id,
  bundle: Bundle,
  namespace: Bundle,
  title: Id,
  order: Order,
  slot: Slot,
  activation: "enabled"
});
const runTest = () => {
  const Count = MakeCounter();
  {
    const Run = Make();
    const [Tab] = Run.OpenSlot("conversation.view");
    const [Panel] = Run.OpenSlot("shell.overlay");
    Check(Count, "S1: the family tab declares the section child slot", () => {
      assert.deepEqual(Tab.options.children, {
        [SECTION]: { kind: "list", scope: "session" }
      });
      assert.equal(Tab.options.name, "conversation.view");
      assert.equal(Tab.options.id, "playform-family");
    });
    Check(Count, "S2: the overlay panel declares its own child slot", () => {
      assert.deepEqual(Panel.options.children, {
        [OVERLAY]: { kind: "list", scope: "root" }
      });
      assert.equal(Panel.options.name, "shell.overlay");
      assert.equal(Panel.options.id, "playform-family-overlay");
    });
  }
  {
    const Run = Make();
    Check(Count, "S3: the thirteen adapters inject exactly the section child slot", () => {
      assert.equal((Run.Injects[SECTION] ?? []).length, 13);
      assert.equal(Run.Injects[OVERLAY], void 0);
    });
    const Records = Run.OpenSlot(SECTION);
    Check(Count, "S4: each adapter registers one child with its exact identity", () => {
      assert.deepEqual(
        Records.map((Record) => ({
          name: Record.options.name,
          id: Record.options.id,
          order: Record.options.order,
          locale: Record.options.locale
        })),
        [
          { name: SECTION, id: "adapter-hook-dsh-normalize-dash", order: 10, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-tool-coach", order: 30, locale: NAMESPACE },
          {
            name: SECTION,
            id: "adapter-hook-dsh-convention-suggester",
            order: 40,
            locale: NAMESPACE
          },
          { name: SECTION, id: "adapter-hook-dsh-normalize-quotes", order: 11, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-normalize-ellipsis", order: 12, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-normalize-spaces", order: 13, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-normalize-invisible", order: 14, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-normalize-fullwidth", order: 15, locale: NAMESPACE },
          { name: SECTION, id: "adapter-plugin-dsh-normalize-file", order: 20, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-package-governor", order: 50, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-package-pinner", order: 55, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-cargo-governor", order: 60, locale: NAMESPACE },
          { name: SECTION, id: "adapter-hook-dsh-ccr", order: 70, locale: NAMESPACE }
        ]
      );
      for (const Record of Records) {
        assert.equal(typeof Record.component, "function");
      }
    });
    Check(Count, "S5: the inject face carries the manifest and the panel ports", () => {
      const Faces = Records.map((Record) => Record.options.inject());
      assert.deepEqual(
        Faces.map((Face) => [
          Face.section.bundle,
          Face.section.namespace,
          Face.section.slot
        ]),
        [
          ["@playform/ets-hook-dsh-normalize-dash", "hook-dsh-normalize-dash", SECTION],
          ["@playform/ets-hook-dsh-tool-coach", "hook-dsh-tool-coach", SECTION],
          ["@playform/ets-hook-dsh-convention-suggester", "hook-dsh-convention-suggester", SECTION],
          ["@playform/ets-hook-dsh-normalize-quotes", "hook-dsh-normalize-quotes", SECTION],
          ["@playform/ets-hook-dsh-normalize-ellipsis", "hook-dsh-normalize-ellipsis", SECTION],
          ["@playform/ets-hook-dsh-normalize-spaces", "hook-dsh-normalize-spaces", SECTION],
          ["@playform/ets-hook-dsh-normalize-invisible", "hook-dsh-normalize-invisible", SECTION],
          ["@playform/ets-hook-dsh-normalize-fullwidth", "hook-dsh-normalize-fullwidth", SECTION],
          ["@playform/ets-plugin-dsh-normalize-file", "plugin-dsh-normalize-file", SECTION],
          ["@playform/ets-hook-dsh-package-governor", "hook-dsh-package-governor", SECTION],
          ["@playform/ets-hook-dsh-package-pinner", "hook-dsh-package-pinner", SECTION],
          ["@playform/ets-hook-dsh-cargo-governor", "hook-dsh-cargo-governor", SECTION],
          ["@playform/ets-hook-dsh-ccr", "hook-dsh-ccr", SECTION]
        ]
      );
      assert.equal(Faces[0].ports.registry, Run.Provided["playformFamilyPanel"]);
      assert.equal(typeof Faces[0].ports.open, "function");
    });
  }
  {
    const Run = Make();
    const Registry = Run.Provided["playformFamilyPanel"];
    Registry.unregister("adapter-hook-dsh-normalize-quotes");
    const Before = Registry.getVersion();
    Registry.register(Adapter("quotes", "@playform/ets-hook-dsh-normalize-quotes"));
    Check(Count, "S6: a duplicate adapter is refused with the documented line", () => {
      const Version = Registry.getVersion();
      const Dispose = Registry.register(
        Adapter("quotes-again", "@playform/ets-hook-dsh-normalize-quotes")
      );
      assert.equal(Registry.getVersion(), Version);
      assert.equal(Version, Before + 1);
      assert.deepEqual(
        Registry.entries(SECTION).filter(
          (Entry) => Entry.bundle === "@playform/ets-hook-dsh-normalize-quotes"
        ).length,
        1
      );
      assert.deepEqual(Run.Warn, [
        "client-dsh-panel-family: duplicate adapter refused for @playform/ets-hook-dsh-normalize-quotes in playform.panel.section"
      ]);
      Dispose();
      assert.equal(Registry.getVersion(), Version);
    });
    Check(Count, "S7: unregister releases the slot ownership for a new adapter id", () => {
      Registry.unregister("quotes");
      const Version = Registry.getVersion();
      Registry.register(Adapter("quotes-again", "@playform/ets-hook-dsh-normalize-quotes"));
      assert.equal(Registry.getVersion(), Version + 1);
      assert.equal(
        Registry.entries(SECTION).filter(
          (Entry) => Entry.id === "quotes-again"
        ).length,
        1
      );
    });
  }
  {
    const Run = Make();
    const Registry = Run.Provided["playformFamilyPanel"];
    Check(Count, "S8: a legacy mount maps onto its slot and entries() filters by slot", () => {
      Registry.register({
        id: "legacy",
        bundle: "@playform/legacy",
        namespace: "legacy",
        title: "legacy",
        order: 5,
        mount: "overlay"
      });
      assert.deepEqual(
        Registry.entries(OVERLAY).map((Entry) => Entry.id),
        ["legacy"]
      );
      assert.equal(
        Registry.entries(SECTION).some((Entry) => Entry.id === "legacy"),
        false
      );
      assert.deepEqual(
        Registry.entries().map((Entry) => Entry.id),
        [
          "legacy",
          "adapter-hook-dsh-normalize-dash",
          "adapter-hook-dsh-normalize-quotes",
          "adapter-hook-dsh-normalize-ellipsis",
          "adapter-hook-dsh-normalize-spaces",
          "adapter-hook-dsh-normalize-invisible",
          "adapter-hook-dsh-normalize-fullwidth",
          "adapter-plugin-dsh-normalize-file",
          "adapter-hook-dsh-tool-coach",
          "adapter-hook-dsh-convention-suggester",
          "adapter-hook-dsh-package-governor",
          "adapter-hook-dsh-package-pinner",
          "adapter-hook-dsh-cargo-governor",
          "adapter-hook-dsh-ccr"
        ]
      );
    });
  }
  {
    const Run = Make();
    const [Tab] = Run.OpenSlot("conversation.view");
    const [Panel] = Run.OpenSlot("shell.overlay");
    Check(Count, "S9: the tab component carries the registry and the renderSlot prop", () => {
      const Calls = [];
      const Element = Tab.component({
        renderSlot: (Name, Props) => Calls.push([Name, Props])
      });
      assert.equal(typeof Element.type, "function");
      assert.equal(Element.props.registry, Run.Provided["playformFamilyPanel"]);
      assert.equal(typeof Element.props.renderSlot, "function");
    });
    Check(Count, "S10: the overlay component renders its declared child slot", () => {
      const Calls = [];
      const Element = Panel.component({
        renderSlot: (Name, Props) => Calls.push([Name, Props])
      });
      assert.equal(Element.type, "div");
      assert.equal(Element.props.className, "playform-family-overlay");
      assert.deepEqual(Calls, [[OVERLAY, {}]]);
    });
  }
  return Finish(Count, "Child-Slot-Model");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = runTest();
  console.log(`${Pass} PASS - Child-Slot-Model`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
