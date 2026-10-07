import { Layer } from "effect";
import type { Context } from "effect";
import * as LedgerService from "./Ledger.js";
import * as JournalService from "./Journal.js";
import * as WriteService from "./Write.js";
import * as GovernService from "./Govern.js";
import type { Host } from "./Journal.js";
export type Tags = LedgerService.Ledger | JournalService.Journal | WriteService.Write | GovernService.Govern;
export type Services = Context.Context<Tags>;
export declare const layers: (Factory: Host) => Layer.Layer<Tags>;
export interface Tracing {
    readonly endpoint?: string;
    readonly serviceName?: string;
}
export declare const tracing: {
    config: Tracing | undefined;
};
/** Enable tracing (the OPT-IN external surface): store the knob's
 *  configuration and dynamically load the optional OpenTelemetry bundle.
 *  Resolves `true` when the bundle loaded and the NEXT `materialize` (and
 *  every one after it) will merge the `NodeSdk.layer` tracing layer;
 *  resolves `false` when the optional packages are absent or unloadable -
 *  tracing silently stays OFF (the default no-op Tracer, the silence
 *  invariant). Awaiting this before constructing the factory shells is the
 *  contract: the runtime materialization is synchronous. */
export declare const enableTracing: (config?: Tracing) => Promise<boolean>;
export declare const materialize: (Factory: Host) => Services;
