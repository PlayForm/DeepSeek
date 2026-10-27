import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    databasePath: Schema<string, string, "defined">;
    currency: Schema<string, string, "defined">;
    client: Schema<string, string, "defined">;
    capture: Schema<Schemastery.ObjectS<NoInfer<{
        sessions: Schema<boolean, boolean, "defined">;
        subagents: Schema<boolean, boolean, "defined">;
        backfill: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        sessions: Schema<boolean, boolean, "defined">;
        subagents: Schema<boolean, boolean, "defined">;
        backfill: Schema<boolean, boolean, "defined">;
    }>>, "plain">;
    attribution: Schema<Schemastery.ObjectS<NoInfer<{
        direct: Schema<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: Schema<"context" | "none", "context" | "none", "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        direct: Schema<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: Schema<"context" | "none", "context" | "none", "defined">;
    }>>, "plain">;
    annotate: Schema<Schemastery.ObjectS<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        marker: Schema<string, string, "defined">;
        maxLines: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        marker: Schema<string, string, "defined">;
        maxLines: Schema<number, number, "defined">;
    }>>, "plain">;
    export: Schema<Schemastery.ObjectS<NoInfer<{
        format: Schema<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: Schema<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        format: Schema<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: Schema<string, string, "defined">;
    }>>, "plain">;
    prices: Schema<({
        provider?: string | null;
        model?: string | null;
        input?: number | null;
        output?: number | null;
        cacheRead?: number | null;
        cacheWrite?: number | null;
        reasoning?: number | null;
        effectiveFrom?: string | null;
        currency?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "defined">;
        input: Schema<number, number, "defined">;
        output: Schema<number, number, "defined">;
        cacheRead: Schema<number, number, "plain">;
        cacheWrite: Schema<number, number, "plain">;
        reasoning: Schema<number, number, "plain">;
        effectiveFrom: Schema<string, string, "defined">;
        currency: Schema<string, string, "defined">;
    }>>[], "defined">;
    log: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    databasePath: Schema<string, string, "defined">;
    currency: Schema<string, string, "defined">;
    client: Schema<string, string, "defined">;
    capture: Schema<Schemastery.ObjectS<NoInfer<{
        sessions: Schema<boolean, boolean, "defined">;
        subagents: Schema<boolean, boolean, "defined">;
        backfill: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        sessions: Schema<boolean, boolean, "defined">;
        subagents: Schema<boolean, boolean, "defined">;
        backfill: Schema<boolean, boolean, "defined">;
    }>>, "plain">;
    attribution: Schema<Schemastery.ObjectS<NoInfer<{
        direct: Schema<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: Schema<"context" | "none", "context" | "none", "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        direct: Schema<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: Schema<"context" | "none", "context" | "none", "defined">;
    }>>, "plain">;
    annotate: Schema<Schemastery.ObjectS<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        marker: Schema<string, string, "defined">;
        maxLines: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        marker: Schema<string, string, "defined">;
        maxLines: Schema<number, number, "defined">;
    }>>, "plain">;
    export: Schema<Schemastery.ObjectS<NoInfer<{
        format: Schema<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: Schema<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        format: Schema<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: Schema<string, string, "defined">;
    }>>, "plain">;
    prices: Schema<({
        provider?: string | null;
        model?: string | null;
        input?: number | null;
        output?: number | null;
        cacheRead?: number | null;
        cacheWrite?: number | null;
        reasoning?: number | null;
        effectiveFrom?: string | null;
        currency?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "defined">;
        input: Schema<number, number, "defined">;
        output: Schema<number, number, "defined">;
        cacheRead: Schema<number, number, "plain">;
        cacheWrite: Schema<number, number, "plain">;
        reasoning: Schema<number, number, "plain">;
        effectiveFrom: Schema<string, string, "defined">;
        currency: Schema<string, string, "defined">;
    }>>[], "defined">;
    log: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
}>>, "plain">;
export default _default;
