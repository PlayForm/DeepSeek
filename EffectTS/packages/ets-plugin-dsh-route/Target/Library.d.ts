import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the routing enforcer plugin (@playform/plugin-dsh-route).
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree (cordis requires them); every other module is a nameless
 * default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property "..." without
 * inject` (the live-verified lesson recorded in the plugin-development skill
 * and in the live-containers entry).
 *
 * @playform/plugin-dsh-route - the routing enforcer: the SILENT model-route
 * policy enforcement on every subagent launch. The user owns the
 * configuration (the policy in his config files); the plugin enforces it,
 * model-independently, and the orchestrator is NOT even bothered:
 *
 * - A launch that omits provider/model/reasoningEffort is resolved per the
 *   user's policy (the task-type rules of the task-routing skill) and the
 *   resolved triple is INJECTED into the launch. No warning, no error, no
 *   reminder.
 * - An explicit-but-wrong route is silently CORRECTED per the policy and
 *   logged to the plugin's own ledger - never surfaced to the orchestrator.
 * - The routing hint (`[route: <taskType> <provider> <model> <effort>]`)
 *   rides into the child's prompt through BOTH halves of the launch seam:
 *   the `subagent` tool's tools/pre-execute waterfall (the launch prompt)
 *   and the child's agent/pre-step waterfall (a child started straight
 *   through `ctx.subagents.startActivation` never passes through a tool).
 * - The escalation path (the attempts ladder: one DeepSeek max re-dispatch
 *   with the artifacts) is automatic and silent: an `ESCALATION:` marker in
 *   the launch spec selects the rung, whose model is verified against the
 *   LIVE catalog (`ctx.llm.listModels` - the `list_subagent_models` source).
 * - Every resolved route is recorded in the plugin's ledger (the audit
 *   format the user reads when he reviews his configuration).
 *
 * The task-type inference applies the documented keyword table
 * (Variable/Keywords) when the launch does not declare a role; the user's
 * policy is the final authority.
 *
 * The plugin ships ENABLED - the live disabled posture: a profile turns it
 * off with `enabled: false`; a cold disabled mount logs
 * `disabled (enabled=false)` and both launch-path listeners no-op
 * to a passthrough (they check State.On first).
 *
 * Sits NEXT TO the BATCH-STATE plugin in the orchestration layer
 * (Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md section 0); the
 * subagent-queue plugin's dispatcher consumes the `dshRoute` service for the
 * routed dispatch. The interface imports are type-only and publish the
 * `tools/pre-execute` vocabulary through @deepseek-ai/dsh-tools' own
 * augmentations (never re-declared here).
 */
export declare const name = "plugin-dsh-route";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
}>>, "plain">;
export { Version };
export declare const inject: string[];
export declare const apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
declare const _default: {
    name: string;
    apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
