/**
 * @module Transform
 *
 * The module-supplied pure transform of the governed file's content.
 *
 * @remarks
 * The heart of the detached contained continuation (Function/Continue):
 * signature documentation and the parameter contract live on the transform
 * interface below.
 */
import type Output from "./Output.js";
/**
 * The module-supplied pure function at the heart of the detached contained
 * continuation (Function/Continue).
 *
 * @remarks
 * The entire content -> next-content step of a module, from the raw file text
 * to the next content. The factory calls it exactly once per continuation
 * with:
 *
 * - `current` - the raw file text as read through ctx.fs.readText (null when
 *   the read failed, e.g. the file vanished); the module decodes (JSON /
 *   TOML) inside, logs its own "observed non-JSON ..." line if the content is
 *   undecodable, and returns null.
 * - `section` - the module's own `Section` state field, if the module mapped
 *   one via the State builder's `fields` (the pinner's dependency sections;
 *   undefined otherwise) - the module may equally ignore it and close over
 *   its own config.
 * - `keep` - the union keep-list from Function/Resolve: the module's policy
 *   sidecars (global -> the file's own directory -> registry-adjacent) plus
 *   the P3 chain-keys union (the registry's `effectiveLatest` names, which
 *   are ALWAYS protected). A module that has no keep-list concept (the
 *   package.json governor) ignores it.
 *
 * @param current - The raw file text as read through ctx.fs.readText; null
 * when the read failed (e.g. the file vanished).
 * @param section - The module's own `Section` state field, when the module
 * mapped one via the State builder's `fields`; undefined otherwise.
 * @param keep - The union keep-list from Function/Resolve.
 * @returns Interface/Output (`{ next, count, message? }`) on change, or
 * `null` for every no-op path (undecodable content, no change, refused
 * rewrite - the module logs its own lines for those before returning null,
 * e.g. the refusal line of the governors). It must not throw for expected
 * conditions; an unexpected throw is contained by Function/Continue.
 */
export default interface Transform {
    (current: string | null, section: unknown, keep: string[]): Output | null;
}
