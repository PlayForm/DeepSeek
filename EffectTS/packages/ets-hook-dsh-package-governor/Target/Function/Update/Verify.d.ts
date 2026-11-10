import type State from "../../Interface/State.js";
export default _default;
/**
 * @module Verify
 *
 * Runs the policy's verifyCommand after the bumps.
 *
 * @remarks
 *
 * Exit 127 is non-fatal: the command was not found because the child's PATH is
 * not the user's shell PATH (pnpm etc. may be absent) - the bumps already
 * landed and the lockfile/store catch-up can be run manually.
 *
 * The command runs through the subprocess seam stored on State (probed once by
 * the factory's State builder, P9) - the seam never shell-interprets argv, so
 * the shell command string is passed as `/bin/sh -c <command>` (same shell
 * semantics as the old spawnSync(shell: true)). When the seam is absent
 * (probed, optional - not an injected service), the node:child_process fallback
 * runs INSIDE the detached continuation. The process management is not exempt -
 * only the ncu binary/library is. Ledger lines go through the FACTORY
 * (State.Factory.Append).
 */
declare function _default(State: State, Command: string, Root: string, Signal: AbortSignal): Promise<boolean>;
