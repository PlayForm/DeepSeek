import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Usage from "../Interface/Usage.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): {
    Resolve(Provider: string, Model: string, At: number): Price;
    Cost(Record: Usage, Rate: Price): {
        Input: number;
        Output: number;
        CacheRead: number;
        CacheWrite: number;
        Reasoning: number;
        Total: number;
        Currency: string;
    };
};
