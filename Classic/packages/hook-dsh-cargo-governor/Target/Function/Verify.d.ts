import type State from "../Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
export default _default;
/**
 * @module Verify
 *
 * Runs the policy's verifyCommand after the cargo upgrade (e.g.
 * `cargo check`).
 *
 * @remarks
 *
 * Exit 127 is non-fatal: the command was not found because the child's PATH is
 * not the user's shell PATH (cargo etc. may be absent) — the bumps already
 * landed and the lockfile/target catch-up can be run manually.
 *
 * The command runs through the `ctx.subprocess` seam when available — the
 * seam never shell-interprets argv, so the shell command string is passed as
 * `/bin/sh -c <command>` (same shell semantics as the package.json governor's
 * verify stage). The seam is OPTIONAL — probed ONCE at State build time (the
 * FACTORY's State builder: Function/Seam's ctx.get("subprocess") — the
 * documented optional-dep probe; the direct accessor is not a fallback, it
 * THROWS on the live root context) and consumed from State here. Undefined →
 * the node:child_process fallback runs INSIDE the detached continuation. The
 * process management is not exempt — only the cargo CLI is.
 *
 * The ledger lines go through the FACTORY's Append (State.Module supplies
 * the "hook-dsh-governor-cargo" prefix — the strings stay the module's).
 */
declare function _default(Factory: PluginFactory, State: State, Command: string, Root: string, Signal: AbortSignal): Promise<boolean>;
