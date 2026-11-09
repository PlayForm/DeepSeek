import type Pack from "../Interface/Pack.js";
/**
 * @module Builtin
 *
 * The BUILT-IN pack for this monorepo: the union of the six suggesters' former
 * embedded packs, extracted here so the family has ONE source of truth.
 *
 * @remarks
 * The families are keyed by the domain-qualified id (`doc/Plan`,
 * `edit/Version`, `search/Version`, ...), so the six domains share the map
 * without colliding on the ids they reuse; a family's `id` stays unqualified
 * because it is the ledger's name.
 *
 * The values are byte-for-byte the packs the six suggesters shipped:
 *
 * - `doc` - the seven documentation-task families;
 * - `edit` - the seven modification families;
 * - `search` - the ten search intents (with their family globs);
 * - `convention` - the four convention intents (with their caveats);
 * - `test` - the two test intents (with their caveats);
 * - `replay` - the one replay intent (with its caveat).
 *
 * Every target carries a kind (`""` where the domain has no kinds), a prior and
 * the one reason phrase; every family carries a note (`""` where the domain has
 * none) and `familyGlobs` (`[]` where the domain has none). The suggester
 * packages project their own domain with `Families(Builtin, domain)`, so the
 * default behaviour is byte-identical to the embedded era.
 */
/** The built-in pack for this monorepo, keyed by domain-qualified family id. */
declare const Builtin: Pack;
export default Builtin;
