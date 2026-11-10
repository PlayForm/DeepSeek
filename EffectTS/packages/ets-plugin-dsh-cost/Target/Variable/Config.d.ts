/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built
 * once at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills
 * every default, so invalid configuration fails LOUD at load instead of
 * silently falling back per-field, and `apply` receives a validated plain
 * config object. The shape this schema produces is Interface/Config.ts.
 *
 * The required price-row columns use `.required()` so a malformed row fails
 * at load (schemastery's "missing required value"); the three optional rates
 * stay optional - an absent rate is an unpriced bucket (charged at zero),
 * not an error. The shipped `prices` default is the three-row price book;
 * each row's own `effectiveFrom`/`currency` defaults fill in at validation.
 * The factor layer's arrays (section 17): `modifiers` ships the four mode
 * multipliers and `priceWindows` the time-of-day windows (empty by
 * default).
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
import Schema from "@deepseek-ai/schemastery";
/**
 * The plugin's Config schema, built once at load.
 */
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
    modifiers: Schema<({
        provider?: string | null;
        model?: string | null;
        kind?: string | null;
        value?: string | null;
        multiplier?: number | null;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "plain">;
        kind: Schema<string, string, "defined">;
        value: Schema<string, string, "defined">;
        multiplier: Schema<number, number, "defined">;
        effectiveFrom: Schema<string, string, "defined">;
        effectiveTo: Schema<string, string, "plain">;
    }>>[], "defined">;
    priceWindows: Schema<({
        label?: string | null;
        startUtcHour?: number | null;
        endUtcHour?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        label: Schema<string, string, "defined">;
        startUtcHour: Schema<number, number, "defined">;
        endUtcHour: Schema<number, number, "defined">;
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
    modifiers: Schema<({
        provider?: string | null;
        model?: string | null;
        kind?: string | null;
        value?: string | null;
        multiplier?: number | null;
        effectiveFrom?: string | null;
        effectiveTo?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        provider: Schema<string, string, "defined">;
        model: Schema<string, string, "plain">;
        kind: Schema<string, string, "defined">;
        value: Schema<string, string, "defined">;
        multiplier: Schema<number, number, "defined">;
        effectiveFrom: Schema<string, string, "defined">;
        effectiveTo: Schema<string, string, "plain">;
    }>>[], "defined">;
    priceWindows: Schema<({
        label?: string | null;
        startUtcHour?: number | null;
        endUtcHour?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
        label: Schema<string, string, "defined">;
        startUtcHour: Schema<number, number, "defined">;
        endUtcHour: Schema<number, number, "defined">;
    }>>[], "defined">;
    log: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
}>>, "plain">;
export default _default;
