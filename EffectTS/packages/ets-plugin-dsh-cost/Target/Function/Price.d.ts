/**
 * @module Price
 *
 * The rate resolution and the cost arithmetic
 * (Documentation/Plans/COST-TRACK-PLUGIN.md sections 2, 17.1 and 17.2).
 *
 * @remarks
 * A call is priced at the most specific ledger price row in force at the
 * call's own time - an exact Mode or Region match wins over a NULL ("any")
 * row, the greatest EffectiveFrom wins among equals, and a call in an
 * unpriced mode or region costs zero - falling back to the configured price
 * book, which is seeded into the ledger's Price table on first use (Source
 * "config", append-only). The arithmetic is the marginal tier walk (section
 * 17.2): for each tier row of the resolved row's rate card in ascending
 * TierFrom, the tokens inside that tier's window are priced at that tier's
 * rate and summed - per bucket, each against its own rate column, because a
 * cached prefix that crosses a threshold is priced per portion rather than
 * per call. After the tier sum, the total and every bucket are multiplied
 * by the product of the applicable modifiers' multipliers (section 17.2): a
 * modifier applies when its Provider matches, its Model is NULL or equals
 * the model, its Kind matches the call's pricing mode, and the call's time
 * is inside its effective window - and a model-specific modifier beats a
 * provider-wide one of the same Kind. An absent bucket (null tokens or a
 * null rate) costs zero. The input side is the UNCACHED remainder plus the
 * cache buckets, never the whole input.
 */
import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
import type Price from "../Interface/Price.js";
import type Rule from "../Interface/Rule.js";
import type Usage from "../Interface/Usage.js";
/**
 * One priced call.
 */
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
