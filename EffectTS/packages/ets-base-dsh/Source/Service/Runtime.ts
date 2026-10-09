// Runtime - the factory's EFFECT RUNTIME (Source/Service/Runtime.ts): the
// layer graph and the run helpers. This is the one new file per the plan
// ("new files only where the runtime lives"): the factory owns the runtime,
// the shell's constructor materializes it ONCE, and every plain-async seam
// calls back into it through the four boundary types of the plan (1.4).
//
// The graph: the four services merged -
//
//   LedgerService   the dsh.ledger.append span + the byte-identical ledger
//   JournalService  the P5 storage writer (the v2 per-record domain spec +
//                   the 3-stage routing), factory-instance-bound
//   WriteService    the ONE shared write executor (the Over bundle, the P4
//                   fence, the Stash, the root-emit, the observe flag)
//   GovernService   the sequential fold + the #14 parallel marker
//
// All four layers are `Layer.succeed` (the machinery is orchestration over
// plain seams - no acquisition, no scoped resources), so the graph builds
// synchronously and can be materialized with a throwaway Scope via
// `Effect.scoped(Layer.build(...))` - the services are plain closures that
// read the shell's instance state (SharedJournal/PendingJournal/GovernSteps)
// at call time, so nothing dies with the build scope.
//
// The materialized `Context` is stored on the shell and provided into every
// service effect at the call sites (`Effect.provide(effect, this.Runtime)`)
// - one build per factory instance, zero per-call rebuilds. The default
// no-op Tracer runs the spans; the OPT-IN external surface (the plan's
// option A, section 3) composes `@effect/opentelemetry`'s `NodeSdk.layer`
// into the same graph - see THE TRACING KNOB below.
//
// THE TRACING KNOB (the plan's section 3, the OPT-IN external surface):
// `enableTracing({ endpoint })` flips the factory's tracing on and
// `materialize` then merges `NodeSdk.layer({ spanProcessor })` - an OTLP
// exporter (`@opentelemetry/exporter-trace-otlp-http`) behind a
// `BatchSpanProcessor` (`@opentelemetry/sdk-trace-base`) - into the layer
// graph, so the `dsh.*` spans leave the process to any OTel collector
// (Tempo/Jaeger). DEFAULT OFF: with the knob unset this module behaves
// EXACTLY as before (the no-op Tracer, the same synchronous build), the
// silence invariant. HYGIENE RULE (the plan): spans never alter ledger
// strings, ordering, or timing-sensitive gates - attributes are read-only
// facts (target, basename, step) - so a smoke run with tracing on must
// produce byte-identical ledgers (the factory smoke's TRACING MODE).
//
// The optional packages load DYNAMICALLY (the family's dynamic-import
// posture, mirroring Function/Open): `@effect/opentelemetry` and the
// OpenTelemetry SDK packages are devDependencies pinned to the
// effect-ts-checkout-era versions, never on the module-load path - a
// module-level import of an unresolvable package would crash the whole
// bundle load - and an unloadable bundle degrades to the no-op Tracer
// (tracing is best-effort by design; it must never break the plugin).
import { Effect, Layer } from "effect";
import type { Context } from "effect";
import * as Scope from "effect/Scope";
import * as LedgerService from "./Ledger.js";
import * as JournalService from "./Journal.js";
import * as WriteService from "./Write.js";
import * as GovernService from "./Govern.js";
import type { Host } from "./Journal.js";

// Tags - the union of the four service tags the graph provides.
export type Tags =
	LedgerService.Ledger | JournalService.Journal | WriteService.Write | GovernService.Govern;

// Services - the materialized runtime's Context type: the four service tags
// resolved, no requirements left.
export type Services = Context.Context<Tags>;

// layers - the full graph for one factory shell (the Journal layer captures
// the instance: the routing reads its SharedJournal/PendingJournal fields at
// call time).
export const layers = (Factory: Host): Layer.Layer<Tags> =>
	Layer.mergeAll(
		LedgerService.layer(),
		JournalService.layer(Factory),
		WriteService.layer(),
		GovernService.layer(),
	);

// materialize - build the graph once and hand back the resolved Context.
// Synchronous by construction (all succeed layers); a failure here is a
// bug-level defect and fails the shell's construction loudly - the loader
// contract has no async seam at this point. When the tracing knob is set
// (and the optional bundle has been loaded via `enableTracing`), the same
// graph is built with the OTel tracing layer merged in - still synchronous
// (`Layer.buildWithScope` over a process-lifetime scope), still no-op-free
// when the knob is unset.

// Tracing - the OPT-IN knob's configuration (the plan's section 3, the
// factory config): `endpoint` is the OTel collector's OTLP/HTTP base URL
// (the exporter posts the protobuf spans there), `serviceName` the
// resource's service.name (default: this package's name). Omitting the
// endpoint falls back to the OpenTelemetry default collector address
// (`http://localhost:4318/v1/traces`).
export interface Tracing {
	readonly endpoint?: string;
	readonly serviceName?: string;
}

// The optional bundle's structural shape - the dynamic imports are typed
// against the pinned devDependencies, but only these three facts are
// consumed: the `NodeSdk.layer` constructor, the OTLP exporter and the
// batch span processor. (Type-only references - erased at runtime; the
// optional packages are never on the module-load path.)
interface OtelBundle {
	NodeSdk: typeof import("@effect/opentelemetry").NodeSdk;
	OTLPTraceExporter: typeof import("@opentelemetry/exporter-trace-otlp-http").OTLPTraceExporter;
	BatchSpanProcessor: typeof import("@opentelemetry/sdk-trace-base").BatchSpanProcessor;
}

// The tracing layer's output: the NodeSdk layer provides the OTel Resource
// (and, at runtime, Effect's Tracer.Tracer through its TracerLayer - the
// declared type names only the Resource, the merged Context still carries
// the tracer).
type TracingLayer = Layer.Layer<typeof import("@effect/opentelemetry").Resource.Resource>;

// The knob: the module-level tracing configuration, `undefined` = OFF (the
// default - the no-op Tracer, byte-identical behavior). The loader (or a
// test harness) sets it through `enableTracing` BEFORE constructing the
// factory shells, because the runtime is materialized synchronously in the
// constructor - a knob set after construction is picked up by the NEXT
// shell, not the running one.
export const tracing: { config: Tracing | undefined } = { config: undefined };

// The optional bundle, loaded ONCE on the first `enableTracing` (dynamic
// imports - the optional packages are never on the module-load path;
// mirroring Function/Open: a module-level import of an unresolvable package
// would crash the whole bundle load). Any load failure resolves `null` and
// tracing stays OFF - best-effort, never a throw into the plugin.
let Bundle: OtelBundle | undefined;
let Loading: Promise<OtelBundle | null> | undefined;

const loadOtel = (): Promise<OtelBundle | null> =>
	(Loading ??= (async (): Promise<OtelBundle | null> => {
		try {
			const [Otel, Exporter, Sdk] = await Promise.all([
				import("@effect/opentelemetry"),
				import("@opentelemetry/exporter-trace-otlp-http"),
				import("@opentelemetry/sdk-trace-base"),
			]);
			return {
				NodeSdk: Otel.NodeSdk,
				OTLPTraceExporter: Exporter.OTLPTraceExporter,
				BatchSpanProcessor: Sdk.BatchSpanProcessor,
			};
		} catch {
			return null;
		}
	})());

/** Enable tracing (the OPT-IN external surface): store the knob's
 *  configuration and dynamically load the optional OpenTelemetry bundle.
 *  Resolves `true` when the bundle loaded and the NEXT `materialize` (and
 *  every one after it) will merge the `NodeSdk.layer` tracing layer;
 *  resolves `false` when the optional packages are absent or unloadable -
 *  tracing silently stays OFF (the default no-op Tracer, the silence
 *  invariant). Awaiting this before constructing the factory shells is the
 *  contract: the runtime materialization is synchronous. */
export const enableTracing = async (config: Tracing = {}): Promise<boolean> => {
	tracing.config = config;
	Bundle = (await loadOtel()) ?? undefined;
	return Bundle !== undefined;
};

// The OTel tracing layer (the plan's option A): `NodeSdk.layer` with one
// OTLP exporter behind a BatchSpanProcessor - spans leave asynchronously
// (never on the caller's critical path - the timing hygiene), attributes
// are the spans' own read-only facts. Built per `materialize` call while
// the knob is on; the exporter and processor are cheap constructions.
const tracingLayer = (): TracingLayer =>
	Bundle!.NodeSdk.layer(() => ({
		spanProcessor: new Bundle!.BatchSpanProcessor(
			new Bundle!.OTLPTraceExporter(
				tracing.config?.endpoint ? { url: tracing.config.endpoint } : {},
			),
		),
		resource: {
			serviceName: tracing.config?.serviceName ?? "@playform/ets-plugin-dsh-factory",
		},
	}));

// The process-lifetime scope for the traced build: the OTel layer
// ACQUIRES its NodeTracerProvider with a shutdown finalizer, so the
// default `Effect.scoped` build (which closes immediately) would shut the
// provider down before any span left. The scope is deliberately never
// closed - the provider lives as long as the process, exactly like the
// no-op Tracer it replaces. (The untraced default path keeps the original
// throwaway-scope build unchanged.)
const TracingScope = Scope.makeUnsafe();

export const materialize = (Factory: Host): Services => {
	const Graph = layers(Factory);
	// The DEFAULT (knob unset, or the bundle not loaded yet): the original
	// synchronous no-op build - byte-identical with the pre-tracing runtime.
	if (tracing.config === undefined || Bundle === undefined) {
		return Effect.runSync(Effect.scoped(Layer.build(Graph)));
	}
	// The OPT-IN traced build: merge the OTel layer into the same graph.
	// The merged Context carries Tracer.Tracer at runtime (the NodeSdk
	// layer's declared type only names Resource.Resource - its TracerLayer
	// provides Effect's Tracer.Tracer service), so `Effect.withSpan` inside
	// the provided services resolves the OTel tracer. Any build failure
	// degrades to the no-op default (best-effort tracing, never a throw).
	try {
		return Effect.runSync(
			Layer.buildWithScope(
				Layer.mergeAll(Graph, tracingLayer()) as Layer.Layer<Tags>,
				TracingScope,
			),
		);
	} catch {
		tracing.config = undefined;
		return Effect.runSync(Effect.scoped(Layer.build(Graph)));
	}
};
