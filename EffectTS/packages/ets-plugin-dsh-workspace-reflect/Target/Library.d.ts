import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the WORKSPACE-REFLECT service
 * (@playform/plugin-dsh-workspace-reflect), the reflect role of the family
 * map.
 *
 * @remarks
 *
 * The role is REFLECT.md; the later stage, the service-provider role. Loader
 * contract: `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree (cordis requires them); every other module is a nameless
 * default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property ... without
 * inject` (live-verified in the factory; a smoke that calls apply directly
 * never catches this).
 *
 * THE ROLE: the code-block reflective ops - the AST-aware rename/connect/
 * replace from a SINGLE call. Each operation bundles the whole transformation
 * (one call instead of a tool choreography), reads the current representation
 * through ctx.fs, applies the transformation to the exact span, and publishes
 * through the factory's guarded write (the replaceIfVersion fence: a file
 * that moved under the operation yields a conflict, never a silent
 * overwrite). THE REPLY IS PART OF THE TYPE: the CommitReply union
 * (applied / conflict / denied / rejected / recovery-required /
 * outcome-unknown), Interface/Reply.ts, typed by the situated interaction
 * protocols (INVERSE-REPRESENTATION.md). After an applied operation the
 * optional workspaceGraph sibling service is asked to re-index the file (the
 * reflective carry) - the sibling shape is SELF-DECLARED in Interface/Graph
 * (the PoC is self-contained; the end-phase wires the real import).
 *
 * THE TWO SIBLING SEAMS (both PROBED through ctx.get at use time, never
 * injected): `workspaceGraph` is the AST source - a Replace may target a
 * Symbol/Block node by id and verify its content-derived fingerprint before
 * rewriting the span (Interface/Node, Function/Locate, Function/Fingerprint);
 * `workspaceSemantics` is the rename's scope-resolved plan source
 * (Interface/Semantics, Function/Deepened) - an absent service leaves the
 * textual whole-word engine (Function/Textual) in charge.
 *
 * The plugin is the OBJECT form (name/apply/Config/inject); the
 * `workspaceReflect` service is a Service subclass in its own module
 * (Function/Service) and is registered from apply. The plugin is a
 * NON-MANIFEST module (no fs/observed machinery of its own): it consumes the
 * factory for the State builder, the ledger and the guarded write. Its own
 * writes go ONLY through that guarded path - never a raw fs write.
 */
export declare const name = "plugin-dsh-workspace-reflect";
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
