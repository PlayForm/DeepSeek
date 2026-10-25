import type Capability from "@Interface/Capability.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Spec: {
    holder: string;
    resource: string;
    operations: string[];
    expiresAt?: number | undefined;
    delegation?: "none" | "delegate";
}): Capability | undefined;
