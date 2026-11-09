/**
 * @module Continue
 *
 * The DETACHED CONTAINED continuation of the `fs/observed` pass
 * (`Function/Continue` in the service API).
 *
 * @remarks
 * Everything the API owns is async, so this stage lives off the listener:
 * the listener (the module's Observe, wired through `Function/Wire`) stays
 * await-free, and every throw is contained - this function's rejections can
 * never surface as a tool error (the silence invariant). Identical
 * architecture to the trio's `Function/Continue`; the MODULE-SPECIFIC content
 * step is the supplied pure transform (`Interface/Transform`), everything
 * else is scaffolding owned here.
 *
 * Lifecycle, exactly:
 *
 * 1. register the pass's abort controller in `State.Inflight` (P2: an unload
 *    aborts it mid-flight; removed in the `finally` below);
 * 2. read the file through `ctx.fs.readText(Target, signal)`
 *    (subsystems/filesystem.md: the target object from the observed event is
 *    reusable; a failed read yields null - e.g. the file vanished);
 * 3. compute the union keep-list: the registry-adjacent discovery
 *    (`Function/Resolve`) with the P3 chain-keys union (the keys of the
 *    discovered registry.json's `effectiveLatest` - an AUXILIARY discovery
 *    read, the standing exemption);
 * 4. call the MODULE'S transform (current = the raw text, section = the
 *    module's own `Section` state field, keep = the union keep-list);
 *    `null` (or `count === 0`) is the designed NO-OP - the factory logs
 *    nothing, the module logged its own line inside the transform;
 * 5. serialize the next content (a string verbatim - the cargo governor's
 *    text surgery; anything else `JSON.stringify(next, null, 2) + "\n"` -
 *    the trio's exact serialization) and perform the guarded write
 *    (`Function/Write`: replaceIfVersion intent, the sandbox-mode-decided
 *    fence, Stash pre-registration). The intent's version is the FRESH
 *    stat of the target (the U2 read-only probe), NOT the observed
 *    version of the triggering event - the observed version is only the
 *    stat-failure fallback. Why: the direct-govern sequential fold hands
 *    the same observed version to every registered step, so a later
 *    step's chain write against it fails FS_STALE_VERSION once an
 *    earlier step's write has advanced the file; writing against the
 *    current version lets the fold converge in any step order;
 * 6. log the module's ledger line when the transform supplied one
 *    (`Interface/Output.message` - verbatim or composed from the outcome's
 *    fresh version);
 * 7. re-emit fs/observed with the same actor (`Function/Refresh` - the P3
 *    stale-version leak fix);
 * 8. every throw is contained: the logger-only suppression line
 *    (`<module>: continuation error (suppressed): ...`) - never the ledger,
 *    never a rethrow.
 */
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type Transform from "../Interface/Transform.js";
export default _default;
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform): Promise<void>;
