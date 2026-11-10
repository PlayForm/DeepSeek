/**
 * @module Config
 *
 * The plugin's Schemastery Config schema.
 *
 * @remarks
 * A Variable: one constant built once at load. Every tunable is a field; the shape this schema
 * produces is Interface/Config.ts.
 *
 * The class plugin (`export default class Feedback extends Service`) carries this schema as a
 * static `Config` (the registry applies a plugin's standard schema to the config before the
 * class is constructed - registry.d.ts Plugin.Base). No volatile cells here: the class form has
 * no factory State to hot-refresh, so a config edit reloads the plugin (the PO C decision is
 * recorded in SCHEME.md).
 *
 * `enabled` defaults to true once the plugin is ACTIVATED: the feedback member is a passive
 * collector - it writes only its own ledger and never touches the waterfall - so its idle risk
 * is the ledger size, capped by maxSessions. The bundle patch still ships `enabled: true`
 * explicit so the activation is visible in the patch.
 */
import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
    maxBlockBytes: Schema<number, number, "defined">;
    maxChain: Schema<number, number, "defined">;
    maxSessions: Schema<number, number, "defined">;
    summaryTerms: Schema<number, number, "defined">;
    maxOutcomes: Schema<number, number, "defined">;
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
    enabled: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
    maxBlockBytes: Schema<number, number, "defined">;
    maxChain: Schema<number, number, "defined">;
    maxSessions: Schema<number, number, "defined">;
    summaryTerms: Schema<number, number, "defined">;
    maxOutcomes: Schema<number, number, "defined">;
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
