/**
 * @module Analysis
 *
 * The five metric families (Documentation/Plans/COST-TRACK-PLUGIN.md
 * sections 11, 12 and 16.2-16.4), the REAL queries now.
 *
 * @remarks
 * Every family is one SELECT over the ledger the cost plugin wrote, the
 * plugin never writes, and each Reading is one key of the asked scope with
 * its metric rows. Every method honours the scope (file, project, client,
 * model, session) and the optional key filter, narrows to the configured
 * day window, orders the readings by their headline value descending, and
 * returns an empty array for a closed database, an unknown scope, an empty
 * key filter or a family switched off in Config.metrics.
 */
import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
import type Reading from "../Interface/Reading.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): {
    Credit(Scope: string, Key?: string): readonly Reading[];
    Effectiveness(Scope: string, Key?: string): readonly Reading[];
    Lines(Scope: string, Key?: string): readonly Reading[];
    Overhead(Scope: string, Key?: string): readonly Reading[];
    Cache(Scope: string, Key?: string): readonly Reading[];
};
