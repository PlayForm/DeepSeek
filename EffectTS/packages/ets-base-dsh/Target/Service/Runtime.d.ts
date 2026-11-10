/**
 * @module Runtime
 *
 * The factory's effect runtime: the layer graph and the run helpers.
 *
 * @remarks
 * This is the one new file per the plan ("new files only where the runtime
 * lives"): the factory owns the runtime, the shell's constructor materializes
 * it once, and every plain-async seam calls back into it through the four
 * boundary types of the plan (1.4).
 *
 * The graph: the four services merged -
 *
 * - LedgerService - the dsh.ledger.append span + the byte-identical ledger.
 * - JournalService - the P5 storage writer (the v2 per-record domain spec +
 *   the 3-stage routing), factory-instance-bound.
 * - WriteService - the one shared write executor (the Over bundle, the P4
 *   fence, the Stash, the root-emit, the observe flag).
 * - GovernService - the sequential fold + the #14 parallel marker.
 *
 * All four layers are `Layer.succeed` (the machinery is orchestration over
 * plain seams - no acquisition, no scoped resources), so the graph builds
 * synchronously and can be materialized with a throwaway Scope via
 * `Effect.scoped(Layer.build(...))` - the services are plain closures that
 * read the shell's instance state (SharedJournal/PendingJournal/GovernSteps)
 * at call time, so nothing dies with the build scope.
 *
 * The materialized `Context` is stored on the shell and provided into every
 * service effect at the call sites (`Effect.provide(effect, this.Runtime)`)
 * - one build per factory instance, zero per-call rebuilds. The default
 * no-op Tracer runs the spans; the opt-in external surface (the plan's
 * option A, section 3) composes `@effect/opentelemetry`'s `NodeSdk.layer`
 * into the same graph - see the tracing knob below.
 *
 * The tracing knob (the plan's section 3, the opt-in external surface):
 * `enableTracing({ endpoint })` flips the factory's tracing on and
 * `materialize` then merges `NodeSdk.layer({ spanProcessor })` - an OTLP
 * exporter (`@opentelemetry/exporter-trace-otlp-http`) behind a
 * `BatchSpanProcessor` (`@opentelemetry/sdk-trace-base`) - into the layer
 * graph, so the `dsh.*` spans leave the process to any OTel collector
 * (Tempo/Jaeger). DEFAULT OFF: with the knob unset this module behaves
 * exactly as before (the no-op Tracer, the same synchronous build), the
 * silence invariant. Hygiene rule (the plan): spans never alter ledger
 * strings, ordering, or timing-sensitive gates - attributes are read-only
 * facts (target, basename, step) - so a smoke run with tracing on must
 * produce byte-identical ledgers (the factory smoke's TRACING MODE).
 *
 * The optional packages load dynamically (the family's dynamic-import
 * posture, mirroring Function/Open): `@effect/opentelemetry` and the
 * OpenTelemetry SDK packages are devDependencies pinned to the
 * effect-ts-checkout-era versions, never on the module-load path - a
 * module-level import of an unresolvable package would crash the whole
 * bundle load - and an unloadable bundle degrades to the no-op Tracer
 * (tracing is best-effort by design; it must never break the plugin).
 */
import { Layer, type Context } from "effect";
import * as GovernService from "./Govern.js";
import * as JournalService from "./Journal.js";
import type { Host } from "./Journal.js";
import * as LedgerService from "./Ledger.js";
import * as WriteService from "./Write.js";
/**
 * Tags - the union of the four service tags the graph provides.
 */
export type Tags = LedgerService.Ledger | JournalService.Journal | WriteService.Write | GovernService.Govern;
/**
 * Services - the materialized runtime's Context type: the four service tags
 * resolved, no requirements left.
 */
export type Services = Context.Context<Tags>;
/**
 * layers - the full graph for one factory shell.
 *
 * @remarks
 * The Journal layer captures the instance: the routing reads its
 * SharedJournal/PendingJournal fields at call time.
 */
export declare const layers: (Factory: Host) => Layer.Layer<Tags>;
/**
 * Tracing - the opt-in knob's configuration (the plan's section 3, the
 * factory config).
 *
 * @remarks
 * `endpoint` is the OTel collector's OTLP/HTTP base URL (the exporter posts
 * the protobuf spans there), `serviceName` the resource's service.name
 * (default: this package's name). Omitting the endpoint falls back to the
 * OpenTelemetry default collector address
 * (`http://localhost:4318/v1/traces`).
 */
export interface Tracing {
    readonly endpoint?: string;
    readonly serviceName?: string;
}
/**
 * The knob: the module-level tracing configuration, `undefined` = OFF (the
 * default - the no-op Tracer, byte-identical behavior).
 *
 * @remarks
 * The loader (or a test harness) sets it through `enableTracing` before
 * constructing the factory shells, because the runtime is materialized
 * synchronously in the constructor - a knob set after construction is picked
 * up by the next shell, not the running one.
 */
export declare const tracing: {
    config: Tracing | undefined;
};
/**
 * Enable tracing (the opt-in external surface): store the knob's
 * configuration and dynamically load the optional OpenTelemetry bundle.
 *
 * @remarks
 * Resolves `true` when the bundle loaded and the next `materialize` (and
 * every one after it) will merge the `NodeSdk.layer` tracing layer;
 * resolves `false` when the optional packages are absent or unloadable -
 * tracing silently stays off (the default no-op Tracer, the silence
 * invariant). Awaiting this before constructing the factory shells is the
 * contract: the runtime materialization is synchronous.
 *
 * @param config - The knob's configuration.
 * @returns Whether the bundle loaded.
 */
export declare const enableTracing: (config?: Tracing) => Promise<boolean>;
export declare const materialize: (Factory: Host) => Services;
