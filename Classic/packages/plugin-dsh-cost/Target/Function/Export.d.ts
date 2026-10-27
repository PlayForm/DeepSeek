import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): (Format: string, Destination?: string) => {
    Path: string;
    Rows: number;
};
