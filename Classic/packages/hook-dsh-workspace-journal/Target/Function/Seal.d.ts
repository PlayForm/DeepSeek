import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, BatchId: string, Next: "verified" | "recovery-required", Reason?: string): Promise<unknown>;
