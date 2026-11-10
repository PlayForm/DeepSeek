/**
 * @module Ledger
 *
 * The factory's ledger service: the `Context.Service` behind the Library's
 * `Append` method.
 *
 * @remarks
 * The machinery itself is unchanged - Function/Append stays the
 * byte-identical plain-fs implementation (logger first, then the durable
 * ledger file via plain `appendFileSync`, the documented exemption, never
 * rethrows) - what changes is the wrapping: the append runs as a typed effect
 * wrapped in a `dsh.ledger.append` span (Effect v4's tracing hook; the
 * default no-op Tracer makes the span zero-cost, an external OTel exporter
 * can pick it up later without touching any caller).
 *
 * Containment lives inside the service: the effect is `Effect.exit`-wrapped,
 * so `append` is `Effect<void>` - it can never fail, which is what allows the
 * shell's sync boundary (`Effect.runSync` at the Library method) to stay
 * non-throwing exactly like the Classic `Append` (the smokes assert "never
 * throws" for a bad ledger path and for `Enabled=false`). Every read of the
 * State's fields happens at call time - the same State object the module
 * built - so no snapshot can drift.
 *
 * The span carries the module identity as a read-only attribute (`module`);
 * it never alters the ledger bytes, the logger prefix, or the ordering
 * (logger first, then the file - both inside the span).
 */
import type State from "@Interface/State.js";
import { Context, Effect, Layer } from "effect";
declare const Ledger_base: Context.ServiceClass<Ledger, "dsh.factory.Ledger", {
    /**
     * The ledger: logger + the durable appendFileSync file, never throws.
     * The effect itself is exit-contained (it can never fail).
     */
    append(State: State, Message: string): Effect.Effect<void>;
}>;
export declare class Ledger extends Ledger_base {
}
export declare const layer: () => Layer.Layer<Ledger>;
export {};
