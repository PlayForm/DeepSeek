import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Rule from "../Interface/Rule.js";
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
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): {
    Resolve(Provider: string, Model: string, At: number, Mode?: string, Region?: string | null, Window?: string): Price;
    Cost(Record: Usage, Rate: Price, Modifiers?: readonly Rule[]): Costed;
    Applied(Provider: string, Kind: string, Model: string, At: number): number;
};
