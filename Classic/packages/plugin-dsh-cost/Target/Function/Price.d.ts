/**
 * @module Price
 *
 * The rate resolution and the cost arithmetic: a call is priced at the most
 * specific ledger price row in force at the call's own time.
 *
 * @remarks
 * The arithmetic follows `Documentation/Plans/COST-TRACK-PLUGIN.md` sections
 * 2, 6, 17.1 and 17.2. The row's effective interval is half-open
 * (EffectiveFrom <= at < EffectiveTo, a NULL EffectiveTo staying open forever),
 * an exact Mode, Region or Window match wins over a NULL or 'any' generic row
 * (so a call in an exact region falls back to the generic row when its region
 * has no row of its own), and the greatest EffectiveFrom wins among equals. A
 * call whose card the book does not carry is UNPRICED: the resolution answers
 * no row identity (PriceId null) and zero rates, the call row keeps PriceId
 * NULL, and its zero money means no rate exists - never that the rate is zero
 * (research section 2.2: a missing rate is unpriced, a known free rate is an
 * explicit zero row). The configured price book is the fallback, seeded into
 * the ledger's Price table on first use (Source "config", append-only), and a
 * configured row whose effective date does not parse is skipped rather than
 * stamped at the epoch - a row at EffectiveFrom 0 would be the row that turns
 * an unpriced call into a priced one.
 *
 * The arithmetic is the marginal tier walk (section 17.2): for each tier row of
 * the resolved row's rate card in ascending TierFrom, the tokens inside that
 * tier's window are priced at that tier's rate and summed - per bucket, each
 * against its own rate column, because a cached prefix that crosses a threshold
 * is priced per portion rather than per call. A tier row belongs to the card of
 * its own Window, Mode and Region, so the family lookup binds the resolved
 * Window beside the effective date, the mode and the region, and the walk never
 * mixes two windows' bands. After the tier sum, the total and every bucket are
 * multiplied by the product of the applicable modifiers' multipliers (section
 * 17.2): a modifier applies when its Provider matches, its Model is NULL or
 * equals the model, its Kind matches the call's pricing mode, and the call's
 * time is inside its effective window - and a model-specific modifier beats a
 * provider-wide one of the same Kind.
 *
 * Two primitives share the arithmetic (research section 2.3, "tiered pricing is
 * not one universal calculation"): the MARGINAL bands above, for a provider
 * that prices successive portions at different rates, and the CONDITIONAL card,
 * for a provider that selects a card from the request's total prompt size. A
 * conditional card is a rate row of the same family whose Note is
 * "condition:at-or-below" or "condition:above": it applies only when the prompt
 * (the uncached input plus both cache buckets) is at or below, or above, the
 * row's own TierFrom threshold, and it prices every bucket flat at its own
 * rates instead of joining the walk - selected before the walk, so a
 * conditional row is never read as a marginal band. A "condition:" marker this
 * build does not know prices nothing at all: the row leaves the ladder and
 * matches no request, so a typo cannot silently become a band. The conditional
 * card fits the existing columns (TierFrom is the threshold, Note the marker)
 * because the unique key still excludes Note, which is why a conditional
 * threshold may not collide with a marginal tier floor of the same family -
 * widening that key to carry Mode, Region, Window and a rule discriminator is a
 * schema migration (P5), so it is named here and not taken.
 *
 * An absent bucket (null tokens or a null rate) costs zero. The input side is
 * the UNCACHED remainder plus the cache buckets, never the whole input.
 */
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
