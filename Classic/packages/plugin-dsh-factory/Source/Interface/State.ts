// State — the SHARED per-apply plugin state the factory builds (Function/
// State) and every factory primitive consumes. A module's own state is this
// shape plus its module-specific fields (copied from config by the State
// builder's `fields` map) — a module declares its own extended interface and
// its instances are assignable to this one, which is what every factory
// method takes.
//
// The collections implement loop control by construction (identical to the
// pre-refactor trio):
//
//   Stash    — targetKey → the version token we last processed (the
//              idempotence gate for our own re-emits within the async window;
//              seeded by GuardedWrite before Refresh re-emits);
//   Inflight — targetKey → the abort controller of the detached continuation
//              in flight (P2: aborted and cleared when the plugin unloads —
//              the Attach effect);
//   Seams    — the probe-once cache of optional services (Function/Seam);
//   Queue    — the pre-open journal queue (capped), drained by Function/Open
//              when the optional storage domain opens (P5).
//
// The opaque identity types come from @deepseek-ai/dsh-fs: `FsTargetKey` and
// `FsVersion` are branded strings the backend owns — the factory stores and
// compares them but never parses or computes them
// (subsystems/filesystem.md).
import type { Context } from "@deepseek-ai/cordis";
import type { FsTargetKey, FsVersion } from "@deepseek-ai/dsh-fs";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import type Record from "@Interface/Journal.js";

export default interface State {
	/** The loading context — carries fs, logger, emit and the event bus. */
	Context: Context;
	/** The module identity — doubles as the logger/ledger prefix for every
	 *  factory-composed line ("hook-dsh-governor-package", "hook-dsh-pinner-package", …). */
	Module: string;
	/** Actor tool names whose fs/observed events trigger the module. */
	Tool: string[];
	/** The configured global policy file (config `policyFile`; "" means
	 *  discovery). Not the union keep-list — see PolicyName/ResolvePolicy. */
	Policy: string;
	/** The policy sidecar file name for union discovery
	 *  ("pin-policy.json" / "update-policy.json"); "" disables sidecar lookup. */
	PolicyName: string;
	/** Ledger file (one global log per module). */
	Ledger: string;
	/** Ledger enabled — write the durable log file. */
	Enabled: boolean;
	/** Excluded path segments (anywhere mode, exclusion-first). */
	List: string[];
	/** targetKey → version token we last processed (idempotence gate). */
	Stash: Map<FsTargetKey, FsVersion>;
	/** targetKey → abort controller of the detached continuation in flight
	 *  (P2: aborted and cleared when the plugin unloads). */
	Inflight: Map<string, { controller: AbortController }>;
	/** The subprocess spawn seam — probed ONCE at State build time (P9: the
	 *  optional `ctx.get("subprocess")` probe replaces the per-site accessor
	 *  fallback). Kept as a named field for trio parity; new seams go through
	 *  Function/Seam. */
	Subprocess: SubprocessService | undefined;
	/** Probe-once cache of optional services (Function/Seam). */
	Seams: Map<string, unknown>;
	/** Storage journal sink (P5): queues into `Queue` until the optional
	 *  `storageDomain` opens, then becomes the real typed-record put; retired
	 *  to a no-op when the domain is absent (the Attach storage effect). */
	Journal: (Event: string, Path: string, Detail: string, At?: number) => void;
	/** Pre-open journal queue (capped at 256), drained by Function/Open. */
	Queue: Record[];
	/** The open storage domain handle (P5) — closed by the Attach effect's
	 *  disposer; `undefined` while setup is pending or after a silent skip. */
	Domain?: { close(): Promise<void> } | undefined;
}
