/**
 * @module Upgrade
 *
 * The update stage's Rust/TS boundary: the cargo CLI driven through the
 * `ctx.subprocess` seam.
 *
 * @remarks
 * The CLI is cargo-edit's `cargo upgrade`, with a fully-specified argv
 * (never shell-interpreted, collect-mode stdio, owned abort signal -
 * docs/subsystems/subprocess.md), exactly as the package.json governor
 * drives ncu in bin mode. Rust does not co-opt into the TypeScript ecosystem
 * - there is no npm-library equivalent for cargo manifest updates - so the
 * CLI is the ONLY update path, at the exclusionary level.
 *
 * THE EXCLUSIONARY LEVEL: the reject/exclusion list is enforced AT THE CLI
 * LEVEL via `--exclude <crate>`, ONE argv pair per crate (verified live,
 * cargo-edit 0.13.13: the flag is repeatable and the COMMA form is silently
 * IGNORED - the exact opposite of ncu's one-comma-argument reject list,
 * which is why this module can't reuse the parent's argv builder). The
 * chain deps are always merged into the list (the cordis-trap analog: cargo
 * upgrade must never bump a chain-governed pin).
 *
 * Policy mapping (Interface/Policy.ts has the full table):
 *   reject  -> --exclude <crate> (per crate)   allow -> -p <crate> (per crate)
 *   incompatible -> --incompatible <allow|ignore>
 *   pinned  -> --pinned <allow|ignore>         compatible -> --compatible <...>
 *   depGroups/targets/concurrency -> no cargo-edit equivalent (ignored)
 *   pinStyle -> no --exact flag exists; manifest-level (chain pass) instead.
 *
 * GRACEFUL NO-CARGO-EDIT PATH: when the binary can't be resolved (spawn
 * ENOENT) or cargo answers "no such command: upgrade" (exit 101 - cargo
 * installed, cargo-edit absent), the ledger gets
 * `update: cargo-edit unavailable: ...` and the stage fails gracefully (the
 * breaker counts it; the verifyCommand path still exists for configured
 * policies - Function/Verify).
 *
 * Output is appended to the ledger by US (collect-mode: the child's streams
 * are read back through Handle.collected); the digest line is
 * `update: cargo upgrade <args> -> {"exitCode":N}`. The ledger lines go
 * through the FACTORY's Append (State.Module supplies the
 * "hook-dsh-governor-cargo" prefix - the strings stay the module's).
 *
 * The granularized units (one definition per file, Update/Upgrade/):
 * Unavailable (the graceful no-cargo-edit detector), Seam (the confined
 * spawn path), Child (the child-process fallback) and Collect (the stream
 * reader) - the same role names the package.json governor's Bin split uses
 * (the naming unification, P4).
 */
import type Invocation from "../../Interface/Invocation.js";
import type Job from "../../Interface/Job.js";
import type Policy from "../../Interface/Policy.js";
import type State from "../../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Binary: string, ManifestPath: string, Cwd: string, Invocation: Invocation, Chosen: Policy, Signal: AbortSignal, Sink: Job | undefined): Promise<boolean>;
