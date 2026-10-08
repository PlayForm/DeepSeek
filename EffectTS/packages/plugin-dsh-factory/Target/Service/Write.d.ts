import { Context, Effect, Layer } from "effect";
import type { Over } from "../Function/Write.js";
import type State from "@Interface/State.js";
import type { FsTarget, FsWriteOutcome } from "@deepseek-ai/dsh-fs";
declare const Write_base: Context.ServiceClass<Write, "dsh.factory.Write", {
    /** The ONE shared write executor: the Over bundle (intent/signal/policy/
     *  actor/observe/stash/transform) resolved inside the effect. Fails with
     *  the underlying seam's error (unknown) - the callers own containment. */
    write(State: State, Target: FsTarget, Content: string, Over?: Over): Effect.Effect<FsWriteOutcome, unknown>;
}>;
export declare class Write extends Write_base {
}
export declare const layer: () => Layer.Layer<Write>;
export {};
