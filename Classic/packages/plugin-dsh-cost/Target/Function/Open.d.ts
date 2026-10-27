import { DatabaseSync } from "node:sqlite";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Config: Config): {
    Database: DatabaseSync;
    Close(): void;
};
