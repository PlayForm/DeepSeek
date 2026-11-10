import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Read
 *
 * Read one pack file and parse it: `.json` through `JSON.parse`, every other
 * extension through the strict YAML-subset parser.
 *
 * @remarks
 *
 * The root must be a mapping. A malformed file throws, and the suggester's
 * fail-open listener turns that into a warning and silence.
 */
declare function _default(Path: string): Pack;
