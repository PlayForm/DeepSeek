import { Context, Effect, Layer } from "effect";
import type State from "@Interface/State.js";
declare const Ledger_base: Context.ServiceClass<Ledger, "dsh.factory.Ledger", {
    /** The ledger: logger + the durable appendFileSync file, never throws.
     *  The effect itself is exit-contained (it can never fail). */
    append(State: State, Message: string): Effect.Effect<void>;
}>;
export declare class Ledger extends Ledger_base {
}
export declare const layer: () => Layer.Layer<Ledger>;
export {};
