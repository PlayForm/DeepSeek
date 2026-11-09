import type { DatabaseSync } from "node:sqlite";
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
type FoldMode = {
    Replay?: boolean;
};
export default _default;
declare function _default(Context: Context, Database: DatabaseSync, Config: Config): (Session: unknown, Events: readonly unknown[], Mode?: FoldMode) => boolean;
