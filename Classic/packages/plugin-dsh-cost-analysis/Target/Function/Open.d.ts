import { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Open
 *
 * The read-only database effect: the ledger's SQLite file opened with
 * `{ readOnly: true }` and returned as `{ Database, Close }`.
 *
 * @remarks
 *
 * The analysis plugin is a reader over the ledger the cost plugin wrote
 * (section 13): it runs no pragma that writes, no migration, and no DDL - if
 * the file does not exist or is not a ledger, the open fails loud with ONE
 * actionable line naming the path, and the entry records the failure so the
 * mount continues without the ledger (the command then says so).
 */
declare function _default(Config: Config): {
    Database: DatabaseSync;
    Close(): void;
};
