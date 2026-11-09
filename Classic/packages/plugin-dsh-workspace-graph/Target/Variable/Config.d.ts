/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every default, so
 * invalid configuration fails LOUD at load instead of silently falling back per-field. The
 * shape this schema produces is `Interface/Config.ts`; every field is one of the brief's frozen
 * config rows (section 4.5, all volatile) and NOTHING else - no hidden knobs.
 *
 * VOLATILE CELLS: every field is `.volatile()` - a hot edit commits into the running fiber
 * without remounting; the service's constructor unwraps the cells once at load
 * (`Function/Unwrap`) and the fail-loud validation (`Function/Validate`) runs on the plain
 * values.
 *
 * `enabled` defaults to FALSE - the IDLE-FOREVER posture: the plugin ships disabled, never
 * appears in the profile's bundles, and enables only by an explicit ACTIVATE.
 *
 * The schema is a real `@deepseek-ai/schemastery` instance - the loader consumes it through the
 * Standard Schema `~standard` interface.
 */
import Schema from "@deepseek-ai/schemastery";
/** The plugin's Config schema: the frozen config table, every field volatile. */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    maxFiles: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
    policy: Schema<NoInfer<Schemastery.ObjectS<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, "volatile">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    maxFiles: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
    policy: Schema<NoInfer<Schemastery.ObjectS<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, "volatile">;
}>>, "plain">;
export default _default;
