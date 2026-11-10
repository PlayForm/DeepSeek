/**
 * @module Config
 *
 * The plugin's Schemastery Config schema.
 *
 * @remarks
 * A Variable: one constant built at load. Every tunable is a field; the shape this schema
 * produces is Interface/Config.ts.
 *
 * The class plugin (`export default class Ingester extends Service`) carries
 * this schema as a static `Config` (validated before construction). The
 * ingester is THE ONLY WRITER of the batch flow (plan section 4) - its knobs
 * bound the write path.
 */
import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
    maxTargets: Schema<number, number, "defined">;
    stopOnConflict: Schema<boolean, boolean, "defined">;
    maxProposals: Schema<number, number, "defined">;
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
    maxTargets: Schema<number, number, "defined">;
    stopOnConflict: Schema<boolean, boolean, "defined">;
    maxProposals: Schema<number, number, "defined">;
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
