export declare const name = "plugin-dsh-cost";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    capture: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, "plain">;
    attribution: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
    }>>, "plain">;
    annotate: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>, "plain">;
    export: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    prices: import("@deepseek-ai/schemastery").default<({
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
        provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        input: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        output: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        cacheRead: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        cacheWrite: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        reasoning: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>[], "defined">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    capture: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, "plain">;
    attribution: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
        amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
    }>>, "plain">;
    annotate: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>, "plain">;
    export: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
        directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    prices: import("@deepseek-ai/schemastery").default<({
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
        provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        input: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        output: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        cacheRead: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        cacheWrite: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        reasoning: import("@deepseek-ai/schemastery").default<number, number, "plain">;
        effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>[], "defined">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, "plain">;
export declare const inject: string[];
export declare const apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
declare const _default: {
    name: string;
    apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        capture: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, "plain">;
        attribution: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
            amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
            amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
        }>>, "plain">;
        annotate: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        }>>, "plain">;
        export: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
            directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
            directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>, "plain">;
        prices: import("@deepseek-ai/schemastery").default<({
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
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            input: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            output: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            cacheRead: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            cacheWrite: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            reasoning: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>[], "defined">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        capture: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            sessions: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            subagents: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            backfill: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, "plain">;
        attribution: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
            amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            direct: import("@deepseek-ai/schemastery").default<"bytes" | "equal", "bytes" | "equal", "defined">;
            amortized: import("@deepseek-ai/schemastery").default<"context" | "none", "context" | "none", "defined">;
        }>>, "plain">;
        annotate: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            marker: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            maxLines: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        }>>, "plain">;
        export: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
            directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            format: import("@deepseek-ai/schemastery").default<"csv" | "json" | "markdown", "csv" | "json" | "markdown", "defined">;
            directory: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>, "plain">;
        prices: import("@deepseek-ai/schemastery").default<({
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
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            input: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            output: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            cacheRead: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            cacheWrite: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            reasoning: import("@deepseek-ai/schemastery").default<number, number, "plain">;
            effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            currency: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        }>>[], "defined">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
