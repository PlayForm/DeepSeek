import type Pack from "../Interface/Pack.js";
export default _default;
/**
 * @module Read
 *
 * Reads one pack file and parses it.
 *
 * @remarks
 *
 * A `.json` file goes through `JSON.parse`, every other extension through the
 * strict YAML-subset parser. The root must be a mapping; a malformed file
 * throws (the suggester's fail-open listener turns that into a warning and
 * silence).
 */
declare function _default(Path: string): Pack;
