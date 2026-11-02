import type Usage from "./Usage.js";
import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
import type { Curation } from "../Interface/Curation.js";
export default _default;
/** One pass over the store: the transitions it applied, or would apply on a dry run. */
declare function _default(Now: Date, Store: Usage, Seam_: Seam, Configuration_: Configuration, DryRun?: boolean): Promise<Curation>;
