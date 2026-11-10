import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

/**
 * @module Library
 *
 * The entry module of the COST TRACKER (`@playform/plugin-dsh-cost`), the
 * per-file inference cost ledger, carrying the loader contract's four exports
 * and the default object.
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` + `export const
 * Config` + `export const inject` + `export default { name, apply, Config,
 * inject }` - the ONLY named exports in the tree (cordis requires them); every
 * other module is a nameless default export composed Rust-style.
 *
 * The default object carries all of them: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property "..." without
 * inject` (the live-verified lesson recorded in the plugin-development skill
 * and in the live-containers entry).
 *
 * `@playform/plugin-dsh-cost` is a telemetry-only reader of the session log
 * that prices every model call from the provider's own usage, splits the price
 * across the files the conversation touched (the direct half for the output,
 * weighted by changed bytes; the amortized half for the input, weighted by
 * per-file context mass), and keeps the whole ledger in one SQLite database.
 * It exports the cost as a client-facing bundle and can write it back into a
 * file as a marker-delimited comment (off by default). It never adds a tool, a
 * prompt section, or a model-visible message: the plugin's surface is the
 * session listeners (the engine lane's capture and flush), the human commands,
 * and the `cost` service below.
 *
 * The engine services: apply also provides `cost` (Interface/Service.ts,
 * Function/Provide.ts) - one session's rows as the panel's CostResponse, read
 * READ-ONLY from the same ledger - and `costPricing` (Interface/
 * PricingService.ts, Function/Pricing.ts), the versioned pricing-catalog
 * service over the v5 tables: catalogs, revisions and rate rows as reads,
 * `publish` as the one write (a published revision and its rate rows, or
 * nothing), and `preview` as the re-pricing that persists nothing. The Cost
 * tab's UI package resolves the services through injection
 * (`ctx.get("cost")`, `ctx.get("costPricing")`), and the `cost` envelope types
 * stay imported from this package's `./service` entry so they have exactly one
 * definition.
 */
/**
 * The loader contract's plugin name (cordis).
 */
export const name = "plugin-dsh-cost";

/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
 */
export const Config = Definition;

/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };

/**
 * Required services. The factory (@playform/plugin-dsh-factory) provides the
 * State builder (cell unwrap + shared fields + the P10 volatile refresh) and
 * the ledger. The token meter is REUSED rather than re-implemented: it prices
 * the model-visible surface (the weights of the amortized half), and it is the
 * one source of the telemetry figures Function/Telemetry would otherwise
 * re-derive from the raw session log - the context window from
 * `contextPressure` and the surface total from `measure` when a caller has
 * none. The meter is projection-backed and replay-stable and reports the
 * provider's own cache buckets, which is why this package needs no
 * @deepseek-ai/dsh-token-meter import: the service is already injected here.
 * The commands service owns the human surface (the three /cost commands, the
 * engine lane's next refinement). The plugin registers NO tool and never
 * touches the model-visible surface.
 */
export const inject = ["pluginFactory", "tokenMeter", "commands"];

export const apply = Apply;

export default { name, apply, Config, inject };
