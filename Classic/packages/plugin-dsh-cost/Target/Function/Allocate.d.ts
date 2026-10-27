import type Allocation from "../Interface/Allocation.js";
import type Config from "../Interface/Config.js";
import type Touch from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";
type Costed = {
    Input: number;
    Output: number;
    CacheRead: number;
    CacheWrite: number;
    Reasoning: number;
    Total: number;
    Currency: string;
};
type Massed = {
    Surface: number;
    PerPath: Map<string, number>;
};
export default _default;
declare function _default(Usage: Usage, Cost: Costed, Touches: readonly Touch[], Mass: Massed, Config: Config): readonly Allocation[];
