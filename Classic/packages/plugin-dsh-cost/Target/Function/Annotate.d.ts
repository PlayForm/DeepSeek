import type { DatabaseSync } from "node:sqlite";
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Database: DatabaseSync, Config: Config): (Path: string) => Promise<{
    Written: boolean;
    Reason: string;
}>;
