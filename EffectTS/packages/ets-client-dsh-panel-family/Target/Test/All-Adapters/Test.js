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
  MakeForms
} from "../Harness.js";
const Apply = (await import("../../Function/Apply.js")).default;
const Form = (await import("../../Function/Form.js")).default;
const Live = (await import("../../Function/Live.js")).default;
const Normalize = (await import("../../Variable/Reference/Normalize.js")).default;
const ToolCoach = (await import("../../Variable/Reference/ToolCoach.js")).default;
const Suggester = (await import("../../Variable/Reference/Suggester.js")).default;
const Quotes = (await import("../../Variable/Reference/Quotes.js")).default;
const Ellipsis = (await import("../../Variable/Reference/Ellipsis.js")).default;
const Spaces = (await import("../../Variable/Reference/Spaces.js")).default;
const Invisible = (await import("../../Variable/Reference/Invisible.js")).default;
const Fullwidth = (await import("../../Variable/Reference/Fullwidth.js")).default;
const NormalizeFile = (await import("../../Variable/Reference/NormalizeFile.js")).default;
const PackageGovernor = (await import("../../Variable/Reference/PackageGovernor.js")).default;
const PackagePinner = (await import("../../Variable/Reference/PackagePinner.js")).default;
const CargoGovernor = (await import("../../Variable/Reference/CargoGovernor.js")).default;
const Ccr = (await import("../../Variable/Reference/Ccr.js")).default;
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
  Ccr
];
const Scopes = () => Schema.object({
  conversation: Schema.boolean().default(true),
  reasoning: Schema.boolean().default(true),
  toolInput: Schema.boolean().default(false),
  toolResults: Schema.boolean().default(false),
  files: Schema.boolean().default(true),
  batch: Schema.boolean().default(false)
}).volatile();
const Exempt = () => Schema.array(Schema.string()).default([
  "read",
  "edit",
  "raw-write",
  "normalize-file",
  "ccr_retrieve",
  "subagent",
  "ask_user_question"
]).volatile();
const FileSchema = () => Schema.object({
  log: Schema.boolean().default(true).volatile(),
  logFile: Schema.string().default("~/.dsh/playform/ets-plugin-dsh-normalize-file.log").volatile(),
  replacement: Schema.string().default("-").volatile(),
  scopes: Scopes(),
  toolResultsExempt: Exempt()
});
const FlavorSchema = (Replacement) => Schema.object({
  log: Schema.boolean().default(true).volatile(),
  logFile: Schema.string().default("~/.dsh/playform/ets-hook-dsh-normalize.log").volatile(),
  ...Replacement ? { replacement: Schema.string().default("...").volatile() } : {},
  normalizeReasoning: Schema.boolean().default(true),
  normalizeToolArguments: Schema.boolean().default(false),
  scopes: Scopes(),
  toolResultsExempt: Exempt()
});
const SharedFields = (LogFile) => ({
  log: Schema.boolean().default(true).volatile(),
  logFile: Schema.string().default(LogFile).volatile(),
  updateCooldownMs: Schema.number().default(3e3).volatile(),
  mutationTools: Schema.array(Schema.string()).default(["write", "edit", "str_replace_editor", "raw-write"]).volatile(),
  policyFile: Schema.string().default(""),
  exclude: Schema.array(Schema.string()).default(["node_modules", ".git", ".dsh"])
});
const GovernorSchema = () => Schema.object({
  ...SharedFields("~/.dsh/playform/ets-hook-dsh-package-governor.log"),
  strict: Schema.boolean().default(false),
  maxUpdateFailures: Schema.number().default(3),
  updateMode: Schema.string().default("programmatic"),
  ncuBin: Schema.string().default("ncu")
});
const PinnerSchema = () => Schema.object({
  ...SharedFields("~/.dsh/playform/ets-hook-dsh-package-pinner.log"),
  sections: Schema.array(Schema.string()).default([
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ])
});
const CargoSchema = () => Schema.object({
  ...SharedFields("~/.dsh/playform/ets-hook-dsh-cargo-governor.log"),
  strict: Schema.boolean().default(false),
  maxUpdateFailures: Schema.number().default(3),
  cargoBin: Schema.string().default("cargo"),
  keepFile: Schema.string().default(""),
  updateMode: Schema.string().default("cargo")
});
const CcrSchema = () => Schema.object({
  log: Schema.boolean().default(true).volatile(),
  logFile: Schema.string().default("~/.dsh/playform/ets-hook-dsh-ccr.log").volatile(),
  targets: Schema.array(String).default([
    "bash",
    "glob",
    "grep",
    "read",
    "web_fetch",
    "web_search",
    "list",
    "search"
  ]),
  exempt: Schema.array(String).default([
    "write",
    "edit",
    "raw-write",
    "subagent",
    "ask_user_question",
    "ccr_retrieve"
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
    default: Schema.number().default(1)
  }).volatile(),
  previewMaxChars: Schema.number().default(240).volatile(),
  ttlSeconds: Schema.number().default(3600),
  storeBudgetBytes: Schema.number().default(268435456),
  journalPath: Schema.string().default(""),
  contextEngine: Schema.boolean().default(false),
  contextEngineThresholdPct: Schema.number().default(30),
  protectFirstTurns: Schema.number().default(2),
  protectLastTurns: Schema.number().default(4)
});
const View = (Ns, Schema2) => ({
  ns: Ns,
  schema: Schema2.toJSON(),
  value: Schema2({}),
  base: {},
  user: {},
  revision: 9
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
  View("hook-dsh-ccr", CcrSchema())
];
const NewAdapterFor = (Namespace) => Roster.find((Section) => Section.namespace === Namespace);
const Derived = (Section, NamespaceView) => Form(Section, {
  view: NamespaceView,
  writable: true,
  available: true,
  bridge: true
});
const FieldNamed = (FormView, Label) => FormView.fields.find((Entry) => Entry.label === Label);
const Ports = (Options = {}) => {
  const Info = [];
  const Warn = [];
  return {
    registry: {
      register: () => () => void 0,
      unregister: () => void 0,
      entries: () => [],
      subscribe: () => () => void 0,
      getVersion: () => 0,
      open: () => void 0
    },
    live: Live(void 0, []),
    open: () => void 0,
    log: {
      info: (Message) => Info.push(Message),
      warn: (Message) => Warn.push(Message)
    },
    ...Options.configForms === void 0 ? {} : { configForms: Options.configForms },
    ...Options.bridge === void 0 ? {} : { bridge: Options.bridge },
    Info,
    Warn
  };
};
const BundleContext = () => {
  const Effects = [];
  const Injects = {};
  const Registered = [];
  const Ctx = {
    get: () => void 0,
    logger: { info: () => void 0, warn: () => void 0, error: () => void 0, debug: () => void 0 },
    locale: { register: () => () => true },
    slots: {
      inject: (Slot, Factory) => {
        Injects[Slot] = [...Injects[Slot] ?? [], Factory];
        return () => true;
      },
      register: (Registration, Component) => {
        Registered.push({ options: Registration, component: Component });
        return () => true;
      }
    },
    effect: (Setup, Label) => {
      Effects.push(Label ?? "unnamed");
      Setup();
      return () => true;
    },
    reflect: { provide: () => () => true }
  };
  return { Ctx, Effects, Injects, Registered };
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "B1: the thirteen shipped manifests are the exact roster", () => {
      assert.deepEqual(
        Roster.map((Adapter) => [
          Adapter.id,
          Adapter.bundle,
          Adapter.namespace,
          Adapter.order,
          Adapter.slot
        ]),
        [
          ["adapter-hook-dsh-normalize-dash", "@playform/ets-hook-dsh-normalize-dash", "hook-dsh-normalize-dash", 10, "playform.panel.section"],
          ["adapter-hook-dsh-tool-coach", "@playform/ets-hook-dsh-tool-coach", "hook-dsh-tool-coach", 30, "playform.panel.section"],
          ["adapter-hook-dsh-convention-suggester", "@playform/ets-hook-dsh-convention-suggester", "hook-dsh-convention-suggester", 40, "playform.panel.section"],
          ["adapter-hook-dsh-normalize-quotes", "@playform/ets-hook-dsh-normalize-quotes", "hook-dsh-normalize-quotes", 11, "playform.panel.section"],
          ["adapter-hook-dsh-normalize-ellipsis", "@playform/ets-hook-dsh-normalize-ellipsis", "hook-dsh-normalize-ellipsis", 12, "playform.panel.section"],
          ["adapter-hook-dsh-normalize-spaces", "@playform/ets-hook-dsh-normalize-spaces", "hook-dsh-normalize-spaces", 13, "playform.panel.section"],
          ["adapter-hook-dsh-normalize-invisible", "@playform/ets-hook-dsh-normalize-invisible", "hook-dsh-normalize-invisible", 14, "playform.panel.section"],
          ["adapter-hook-dsh-normalize-fullwidth", "@playform/ets-hook-dsh-normalize-fullwidth", "hook-dsh-normalize-fullwidth", 15, "playform.panel.section"],
          ["adapter-plugin-dsh-normalize-file", "@playform/ets-plugin-dsh-normalize-file", "plugin-dsh-normalize-file", 20, "playform.panel.section"],
          ["adapter-hook-dsh-package-governor", "@playform/ets-hook-dsh-package-governor", "hook-dsh-package-governor", 50, "playform.panel.section"],
          ["adapter-hook-dsh-package-pinner", "@playform/ets-hook-dsh-package-pinner", "hook-dsh-package-pinner", 55, "playform.panel.section"],
          ["adapter-hook-dsh-cargo-governor", "@playform/ets-hook-dsh-cargo-governor", "hook-dsh-cargo-governor", 60, "playform.panel.section"],
          ["adapter-hook-dsh-ccr", "@playform/ets-hook-dsh-ccr", "hook-dsh-ccr", 70, "playform.panel.section"]
        ]
      );
    });
  }
  {
    const Run = Make();
    const EffectLabels = Run.Effects.filter(
      (Label) => Label.startsWith("panel: adapter ")
    );
    Check(Count, "B2: the client apply wires exactly thirteen adapter effects", () => {
      assert.equal(EffectLabels.length, 13);
      assert.deepEqual(
        EffectLabels,
        Roster.map((Adapter) => `panel: adapter ${Adapter.id}`)
      );
    });
    const Records = Run.OpenSlot("playform.panel.section");
    Check(Count, "B3: the thirteen adapters register one section child each", () => {
      assert.equal((Run.Injects["playform.panel.section"] ?? []).length, 13);
      assert.equal(Run.Injects["playform.panel.overlay"], void 0);
      assert.deepEqual(
        Records.map((Record) => [Record.options.id, Record.options.order]),
        Roster.map((Adapter) => [Adapter.id, Adapter.order])
      );
    });
    Check(Count, "B4: every manifest is enabled and follows the three D5 names", () => {
      for (const Adapter of Roster) {
        assert.equal(Adapter.activation, "enabled");
        assert.deepEqual(Adapter.traceKinds, [
          "observe/stamp",
          "graph/indexed",
          "graph/invalidated"
        ]);
      }
    });
  }
  {
    const Representatives = [
      ["hook-dsh-normalize-quotes", ["logFile", "log", "scopes.conversation", "toolResultsExempt"]],
      ["hook-dsh-normalize-ellipsis", ["logFile", "replacement", "log", "scopes.conversation", "toolResultsExempt"]],
      ["hook-dsh-normalize-spaces", ["replacement", "logFile"]],
      ["hook-dsh-normalize-invisible", ["replacement"]],
      ["hook-dsh-normalize-fullwidth", ["logFile", "toolResultsExempt"]],
      ["plugin-dsh-normalize-file", ["replacement", "logFile", "toolResultsExempt"]],
      ["hook-dsh-package-governor", ["updateCooldownMs", "mutationTools", "logFile"]],
      ["hook-dsh-package-pinner", ["updateCooldownMs", "mutationTools"]],
      ["hook-dsh-cargo-governor", ["updateCooldownMs", "mutationTools"]],
      ["hook-dsh-ccr", ["thresholdBytes", "multipliers.error", "previewMaxChars", "logFile"]]
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
          assert.notEqual(Field, void 0, `${Namespace}: ${Label} missing`);
          assert.equal(Field.volatile, true, `${Namespace}: ${Label} not volatile`);
        }
      }
    });
  }
  {
    const Representatives = [
      ["hook-dsh-normalize-quotes", ["normalizeReasoning", "normalizeToolArguments"]],
      ["hook-dsh-normalize-ellipsis", ["normalizeReasoning", "normalizeToolArguments"]],
      ["hook-dsh-normalize-spaces", ["normalizeReasoning", "normalizeToolArguments"]],
      ["hook-dsh-normalize-invisible", ["normalizeReasoning", "normalizeToolArguments"]],
      ["hook-dsh-normalize-fullwidth", ["normalizeReasoning", "normalizeToolArguments"]],
      ["hook-dsh-package-governor", ["strict", "maxUpdateFailures", "updateMode", "ncuBin"]],
      ["hook-dsh-package-pinner", ["sections", "policyFile", "exclude"]],
      ["hook-dsh-cargo-governor", ["strict", "maxUpdateFailures", "cargoBin", "keepFile", "updateMode"]],
      ["hook-dsh-ccr", ["targets", "exempt", "autoExpand", "ttlSeconds", "contextEngine"]]
    ];
    Check(Count, "B6: the plain representatives and the all-volatile file flavor", () => {
      for (const [Namespace, PlainLabels] of Representatives) {
        const Section = NewAdapterFor(Namespace);
        const FormView = Derived(Section, Views.find((Entry) => Entry.ns === Namespace));
        for (const Label of PlainLabels) {
          const Field = FieldNamed(FormView, Label);
          assert.notEqual(Field, void 0, `${Namespace}: ${Label} missing`);
          assert.equal(Field.volatile, false, `${Namespace}: ${Label} not plain`);
        }
      }
      const FileForm = Derived(
        NewAdapterFor("plugin-dsh-normalize-file"),
        Views.find((Entry) => Entry.ns === "plugin-dsh-normalize-file")
      );
      assert.equal(FileForm.fields.length > 0, true);
      for (const Field of FileForm.fields) {
        assert.equal(Field.volatile, true, `plugin-dsh-normalize-file: ${Field.label} not volatile`);
      }
    });
  }
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
          revision: 9
        }
      ]);
    });
    const GovernorView = Views.find((Entry) => Entry.ns === "hook-dsh-package-governor");
    const GovernorForm = Derived(PackageGovernor, GovernorView);
    const Bridged = MakeBridge();
    const PortsWithBridge = Ports({
      configForms: MakeForms(Views).Forms,
      bridge: Bridged.Bridge
    });
    const Strict = FieldNamed(GovernorForm, "strict");
    const PlainAccepted = await Apply(
      PortsWithBridge,
      PackageGovernor,
      GovernorForm,
      Strict,
      true
    );
    Check(Count, "B8: a governor plain write rides the bridge with the audit line", () => {
      assert.equal(PlainAccepted, true);
      assert.deepEqual(Bridged.Writes[0].namespace, "hook-dsh-package-governor");
      assert.equal(Bridged.Writes[0].patch.strict, true);
      assert.deepEqual(PortsWithBridge.Info, [
        "client-dsh-panel-family: plain-field write hook-dsh-package-governor strict"
      ]);
    });
  }
  {
    Check(Count, "B9: the built bundle executes and registers the thirteen adapters", () => {
      const Code = BundleSource();
      assert.equal(Code.includes("window.__ModuleLoader__.load({"), true);
      const Rows = [];
      const Window = {
        __ModuleLoader__: { load: (Row) => Rows.push(Row) }
      };
      new Function("window", Code)(Window);
      assert.equal(Rows.length, 1);
      assert.equal(Rows[0].id, "@playform/ets-client-dsh-panel-family");
      assert.equal(typeof Rows[0].factory, "function");
      const Exports = Rows[0].factory((Name) => {
        assert.equal(Name, "react");
        return React;
      });
      assert.deepEqual(Exports.inject, ["slots", "locale"]);
      assert.equal(typeof Exports.apply, "function");
      assert.deepEqual(Exports.default.inject, ["slots", "locale"]);
      const Recorded = BundleContext();
      Exports.apply(Recorded.Ctx);
      assert.equal(
        Recorded.Effects.filter((Label) => Label.startsWith("panel: adapter ")).length,
        13
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
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - All-Adapters`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
