import type { DatabaseSync } from "node:sqlite";
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
/**
 * The fold's mode: Replay rebuilds one session's in-memory replay state from
 * an already-booked prefix and books nothing - no row, no cursor advance, no
 * capture-queue acknowledgement.
 *
 * @remarks
 * Every caller that omits it books, which is the live flush and the whole
 * of the backfill's booking pass.
 */
type FoldMode = {
    Replay?: boolean;
};
export default _default;
declare function _default(Context: Context, Database: DatabaseSync, Config: Config): (Session: unknown, Events: readonly unknown[], Mode?: FoldMode) => boolean;
