import type { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Database: DatabaseSync, Config: Config): () => {
    Allocations: number;
    Rollups: number;
};
