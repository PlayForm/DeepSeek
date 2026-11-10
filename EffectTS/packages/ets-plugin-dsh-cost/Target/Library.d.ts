import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the COST TRACKER (@playform/ets-plugin-dsh-cost).
 *
 * @remarks
 *
 * THE EXPORT SURFACE AND THE LOADER CONTRACT: `export const name` +
 * `export const apply` + `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree (cordis requires them); every other module is a nameless
 * default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the
 * default object, or service accessors throw `cannot get property "..."
 * without inject` (the live-verified lesson recorded in the
 * plugin-development skill and in the live-containers entry).
 *
 * THE ROLE: @playform/ets-plugin-dsh-cost - the per-file inference cost
 * ledger: a telemetry-only reader of the session log that prices every
 * model call from the provider's own usage, splits the price across the
 * files the conversation touched (the direct half for the output, weighted
 * by changed bytes; the amortized half for the input, weighted by per-file
 * context mass), and keeps the whole ledger in one SQLite database. It
 * exports the cost as a client-facing bundle and can write it back into a
 * file as a marker-delimited comment (off by default). It never adds a
 * tool, a prompt section, or a model-visible message: the plugin's surface
 * is the session listeners (the engine lane's capture and flush) and the
 * human commands only.
 */
/**
 * The plugin's loader name.
 */
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
    modifiers: import("@deepseek-ai/schemastery").default<({
        provider?: string | null;
        model?: string | null;
        kind?: string | null;
        value?: string | null;
        multiplier?: number | null;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        model: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        kind: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        value: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        multiplier: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        effectiveTo: import("@deepseek-ai/schemastery").default<string, string, "plain">;
    }>>[], "defined">;
    priceWindows: import("@deepseek-ai/schemastery").default<({
        label?: string | null;
        startUtcHour?: number | null;
        endUtcHour?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        label: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        startUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        endUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
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
    modifiers: import("@deepseek-ai/schemastery").default<({
        provider?: string | null;
        model?: string | null;
        kind?: string | null;
        value?: string | null;
        multiplier?: number | null;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        model: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        kind: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        value: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        multiplier: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        effectiveTo: import("@deepseek-ai/schemastery").default<string, string, "plain">;
    }>>[], "defined">;
    priceWindows: import("@deepseek-ai/schemastery").default<({
        label?: string | null;
        startUtcHour?: number | null;
        endUtcHour?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        label: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        startUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        endUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>[], "defined">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, "plain">;
export { Version };
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
        modifiers: import("@deepseek-ai/schemastery").default<({
            provider?: string | null;
            model?: string | null;
            kind?: string | null;
            value?: string | null;
            multiplier?: number | null;
            effectiveFrom?: string | null;
            effectiveTo?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            kind: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            value: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            multiplier: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            effectiveTo: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        }>>[], "defined">;
        priceWindows: import("@deepseek-ai/schemastery").default<({
            label?: string | null;
            startUtcHour?: number | null;
            endUtcHour?: number | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            label: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            startUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            endUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
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
        modifiers: import("@deepseek-ai/schemastery").default<({
            provider?: string | null;
            model?: string | null;
            kind?: string | null;
            value?: string | null;
            multiplier?: number | null;
            effectiveFrom?: string | null;
            effectiveTo?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            provider: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            model: import("@deepseek-ai/schemastery").default<string, string, "plain">;
            kind: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            value: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            multiplier: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            effectiveFrom: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            effectiveTo: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        }>>[], "defined">;
        priceWindows: import("@deepseek-ai/schemastery").default<({
            label?: string | null;
            startUtcHour?: number | null;
            endUtcHour?: number | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            label: import("@deepseek-ai/schemastery").default<string, string, "defined">;
            startUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
            endUtcHour: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        }>>[], "defined">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
