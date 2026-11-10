/**
 * @module Transform
 *
 * The MODULE LEAF of the factory refactor: the entire content ->
 * next-content step of the cargo module, as a FACTORY TRANSFORM.
 *
 * @remarks
 * The shape is `(current, section, keep) => { next, count, message? } |
 * null` (Interface/Transform in the factory). The factory's Continue hands
 * off here with the raw file text (null when the read failed), the module's
 * `Section` state field (inert for this module - see Interface/State) and
 * the UNION KEEP-LIST it computed (Function/ResolvePolicy: the sidecars plus
 * the P3 chain keys - chain pins are ALWAYS protected).
 *
 * The pipeline (identical to the pre-refactor Continue/Satisfy/Pin sequence,
 * the smoke suite is the arbiter):
 *
 *   1. Decode (smol-toml, identification ONLY) - null -> the
 *      "observed non-JSON/TOML Cargo.toml ... - skipped" line, transform null
 *      (the factory stays silent on every no-op path);
 *   2. the update-policy path (Function/Resolve, first-wins - engine input)
 *      is resolved QUIETLY here and recorded in the caller's passage cell,
 *      so the post-continuation update stage (Function/Dispatch) reuses the
 *      exact same path; only its pinStyle drives the chain pass (caret = the
 *      bare resolved string - Cargo's implicit caret; exact = `=resolved`);
 *   3. the KEEP-LIST: the factory's union (sidecars + P3 chain keys) PLUS
 *      the module's own global `keepFile` source (config `keepFile` -
 *      Transform/Keep, the absorbed pre-refactor Keep semantics);
 *   4. Satisfy - the chain pass (P): 1. CHAIN (always the FULL resolved
 *      form), 2. STRIP (strict, registry present), 3. NORMALIZE (the
 *      full-version directive; the keep-list wins);
 *   5. THE REFUSAL GUARD (Transform/Guard): any plan entry outside an
 *      identified dependency table REFUSES the rewrite (logged, null
 *      returned);
 *   6. Pin - the SURGICAL LINE-LEVEL rewrite of the raw text: comments,
 *      inline comments, blank lines and spacing survive byte-for-byte (the
 *      internal calculation that makes comment preservation possible; never
 *      a TOML stringify). A Pin refusal (an entry not locatable in the text -
 *      never a partial rewrite) is logged and null is returned.
 *
 * On change the transform returns `{ next: <the rewritten TEXT>, count,
 * message }` - next is a STRING, and the factory's Continue serializes a
 * string next VERBATIM (the comment-preservation guarantee end-to-end). The
 * success line (`governed <path> -> <version>`) is supplied as a message
 * FUNCTION of the write outcome's fresh version.
 *
 * Pure internal calculations (the standing exemptions): the smol-toml parse,
 * the surgical line rewrite, Normalize's padding, and the auxiliary
 * pin-policy.json read (plain fs, never the governed manifest).
 */
import type { FsVersion } from "@deepseek-ai/dsh-fs";
import type Passage from "../Interface/Passage.js";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Path: string, Dir: string, Found: string | null, Registry: Registry | null, Passage: Passage): ((current: string | null, section: unknown, keep: string[]) => {
    next: unknown;
    count: number;
    message?: string | ((outcome: {
        version: FsVersion;
    }) => string) | undefined;
} | null);
