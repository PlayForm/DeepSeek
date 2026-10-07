import { Context, Effect, Layer } from "effect";
import type { Registry, Selection } from "../Function/Govern.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
declare const Govern_base: Context.ServiceClass<Govern, "dsh.factory.Govern", {
    /** The direct-govern entry: resolve the registered steps for the
     *  target's basename, filter by the selection, run each contained - the
     *  sequential fold by default, the #14 parallel marker opt-in. */
    run(Steps: Registry, Target: FsTarget, Selection: Selection, Actor: object | undefined, Version: FsVersion): Effect.Effect<void>;
}>;
export declare class Govern extends Govern_base {
}
export declare const layer: () => Layer.Layer<Govern>;
export {};
