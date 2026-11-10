import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module: the loader contract's four names, the Config schema, and the plugin
 * account.
 *
 * @remarks
 *
 * The entry module (mirrors Source/Library.rs). Loader contract: `export const name` +
 * `export const apply` + `export const Config` + `export const inject` + `export default
 * { name, apply, Config, inject }` - the ONLY named exports in the tree (cordis requires
 * them); every other module is a nameless default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }` SHADOWS the
 * named exports - inject and Config MUST also sit on the default object, or service
 * accessors throw `cannot get property "fs" without inject` (live-verified 2026-10-03; a
 * smoke that calls apply directly never catches this).
 *
 * @playform/hook-dsh-live-containers - the live-containers hook. The model (and the
 * user) want DYNAMIC, MODIFIABLE CONVERSATION BLOCKS: each enabled block is a labeled
 * stanza recomputed at every request - the canonical example is a time block that always
 * holds the current time at ask-time while the rest of the conversation stays static. The
 * blocks ride the system-prompt/assemble waterfall as ONE appended section (interpolate:
 * false, so only the plugin's own substitution engine touches its {{token}} groups), each
 * block inside a fixed frame so the model cannot mistake it for harness state:
 *
 * ```
 * --- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
 * <rendered body>
 * --- END LIVE CONTAINER <id> ---
 * ```
 *
 * WAVE 2 (the C2 extension): the live tool-call transform (CAN-1) - command calls detach
 * into ctx.jobs background jobs, the model gets a "[live] ... running" marker as a
 * SUCCESSFUL tool result, and the completion report arrives as a dynamic-context
 * user-role snapshot (the I3 carrier) batched per turn (I4); planted boards (CAN-2) with
 * the I5 lease; the CAN-4 failsafe engine (silent, ledger-first); and the CAN-5 suggester
 * with the one-word accept/dismiss verbs. Every new knob is volatile.
 *
 * Substitution is {{token}} replace ONLY - no eval, no expressions (the programmable
 * stage is future work and will route through the ptc-runtime). Every knob is a volatile
 * cell (hot edits commit without remounting). The counters (messages, turns, since last
 * tool) come from the plugin's own agent/pre-step and tools/post-execute observers -
 * exact token counts are NOT available to plugins, the gauge variables say so.
 *
 * THE IDLE-FOREVER POSTURE: the plugin ships DISABLED (schema default and patch entry),
 * never appears in the profile's bundles, and enables only by an explicit ACTIVATE; a
 * cold mount logs `disabled (enabled=false)` and every listener no-ops to a passthrough.
 *
 * FULLY CONTRACT-AWARE: every listener awaits next() FIRST and is fail-open (never
 * throws into a waterfall). The plugin is a NON-MANIFEST module (no fs/observed
 * machinery) that consumes the factory for the State builder (with the P10 volatile
 * refresh) and the ledger. The per-agent wave-2 state is keyed on the agent's session
 * id; the durable record is the ledger file (one log per module).
 */
export declare const name = "hook-dsh-live-containers";
/**
 * Loader contract (cordis): the exported schema is validated and defaulted while the
 * plugin loads; apply receives a plain validated config object.
 */
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
/**
 * The compiled package version (Source/Variable/Version, built in by the ESBuild define)
 * - NOT a loader key: the contract's four names (name, apply, Config, inject) are
 * unchanged, and the default object below stays exactly { name, apply, Config, inject }.
 */
export { Version };
/**
 * Required services (skill: declare, never rely on load order). The factory
 * (@playform/ets-plugin-dsh-factory) provides the State builder (cell unwrap + shared
 * fields + the P10 volatile refresh) and the ledger. `tools` serves the
 * live_container_set/live_plant registrations. The wave-2 extension appends its
 * consumers: `systemPrompt` serves the completion dynamic context (the I3 carrier), and
 * the jobs/shell/shellEnv/workingDirectory trio serves the producer re-dispatch (G2).
 * The plugin registers NO fs/observed listener, never touches the factory executor, and
 * never writes files outside its own ledger. The agents/subagent registries are read
 * through Context.get at use time (the tool-jobs precedent) - they are not injection
 * dependencies.
 */
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
