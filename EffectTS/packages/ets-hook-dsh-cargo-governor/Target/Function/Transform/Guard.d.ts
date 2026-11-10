/**
 * @module Guard
 *
 * The refusal guard of the cargo transform: only identified dependency
 * tables may differ.
 *
 * @remarks
 * Returns the intruding section name (the planned entry whose section is
 * not an identified dependency table) or null when the plan stays inside
 * the manifest's own tables - the caller composes the byte-identical
 * REFUSED line and returns null (the update stage is skipped too, exactly
 * the pre-refactor flow). Pure.
 */
import type Manifest from "../../Interface/Manifest.js";
import type Plan from "../../Interface/Plan.js";
export default _default;
declare function _default(Manifest: Manifest, Planned: Plan): string | null;
