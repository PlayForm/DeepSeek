import type { SkillsSlice } from "../Interface/Services.js";
/** Where to list from: the agent's working directory and the run's signal. */
export interface CatalogOptions {
    readonly cwd?: string;
    readonly signal?: AbortSignal;
}
export default _default;
declare function _default(Skills: SkillsSlice, Options: CatalogOptions): Promise<readonly string[]>;
