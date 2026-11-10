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
