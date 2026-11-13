import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the BATCH EDIT TOOL (@playform/plugin-dsh-batch-edit,
 * the tool-primary plugin of the planned workspace suite - the `plugin-`
 * prefix since a tool is the primary surface, like plugin-dsh-factory).
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports in
 * the tree (cordis requires them); every other module is composed Rust-style
 * with nameless defaults or a Function namespace.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property "fs" without inject`
 * (the default-object-shadows pitfall).
 *
 * The philosophy (the user's binding framing): each file on the system is a
 * PROCESS the harness holds (Process<Observation> re-typed onto files). The
 * tool `batch_edit` opens a machine (the agent PREPARES ITS OWN SCHEMA: named
 * searches + the transition table, validated fail-loud at open), inserts files
 * into it as observed processes with their held version, and commits the table
 * in one go. Every write goes through Factory.Write and nothing else (the
 * governors see the batch's writes exactly as they see any write); the
 * governed basenames re-run through the factory's direct path exactly once per
 * write (the `govern` actor marker, Gate.ts route 2 - re-route, never bypass).
 * The atomic gate means the batch completes or the batch does not exist. A
 * held file touched externally HALTS its process (stale, protected and
 * resumable); a commit exceeding the deadline continues as a background job
 * with a typed jobId handle.
 *
 * THE LIVE DISABLED POSTURE: every listener, the batch_edit tool and the root
 * observer register unconditionally on every mount; a disabled mount
 * (`enabled: false`) logs the byte-exact `disabled (enabled=false)` line
 * instead of the activation proof, and every registered surface reads the
 * volatile `On` cell at CALL time, so a disabled surface passes through with
 * zero ledger lines and the tool refuses loudly while disabled.
 *
 * Plans: Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md (the hub) +
 * Documentation/Plans/Batch-Edit-Tool/SCHEMA.md, STATE-MACHINE.md,
 * PACKAGE-AND-GOVERNANCE.md, ACCEPTANCE-CRITERIA.md.
 */
export declare const name = "plugin-dsh-batch-edit";
/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
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
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };
/**
 * Required services (skill: declare, never rely on load order). The factory
 * (@playform/plugin-dsh-factory) provides the State builder, the write
 * executor, the direct-govern entry and the ledger. `tools` serves the
 * batch_edit registration. `jobs` serves the background-branch deadline
 * overflow (the typed jobId handle); the still-probed accessor in Tools.ts
 * keeps an absent hub a graceful degradation to the halted state. `fs` backs
 * the machine's resolve/stat/read (Machine.ts, Ops.ts, Tools.ts read
 * State.Context.fs) - the LIVE dogfood caught it missing here: the fake-ctx
 * smokes provided `get("fs")`, so only the real harness surfaced the
 * `cannot get property "fs" without inject` failure. The plan's remaining
 * inject entries (systemPrompt, shell, shellEnv, workingDirectory) belong to
 * the intercept/monitor layers that are later work - v1 does not inject what
 * it does not consume.
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
