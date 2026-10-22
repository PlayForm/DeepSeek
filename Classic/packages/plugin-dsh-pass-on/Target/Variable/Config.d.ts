import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
    root: Schema<string, string, "defined">;
    maxTargets: Schema<number, number, "defined">;
    maxPreviewBytes: Schema<number, number, "defined">;
    expiresSeconds: Schema<number, number, "defined">;
    kinds: Schema<import("@deepseek-ai/cosmokit").Dict<{
        globs?: string[] | null;
        param?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        globs: Schema<string[], string[], "defined">;
        param: Schema<string, string, "plain">;
    }>>, string>, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
    root: Schema<string, string, "defined">;
    maxTargets: Schema<number, number, "defined">;
    maxPreviewBytes: Schema<number, number, "defined">;
    expiresSeconds: Schema<number, number, "defined">;
    kinds: Schema<import("@deepseek-ai/cosmokit").Dict<{
        globs?: string[] | null;
        param?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
        globs: Schema<string[], string[], "defined">;
        param: Schema<string, string, "plain">;
    }>>, string>, "defined">;
}>>, "plain">;
export default _default;
