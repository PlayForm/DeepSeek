// Config - the shape the hook's Schemastery schema (Variable/Config.ts)
// produces after validation and defaulting; `apply` receives this plain
// object, with volatile cells holding `{ get }` references until the
// factory's State builder unwraps them. The contract is
// Documentation/Plans/Workspace-Family/MONITOR.md (the distribution law:
// the hook's own Config) and the live-containers monitor precedent.
import type CheckSet from "@Interface/CheckSet.js";
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** The hook's own ledger file (one log per module). */
	logFile: string;
	/** The IDLE-forever posture: false by default; an explicit ACTIVATE. */
	enabled: boolean;
	/** The KV domain name reserved for the hook (its own domain, never the
	 *  shared package_governance one). */
	domain: string;
	/** The debounce window in milliseconds between a watch stamp and the
	 *  earliest sweep of that entry (clock-based, never a real timer). */
	debounceMs: number;
	/** The sweep cadence in milliseconds: how long an entry waits after a
	 *  sweep before it becomes sweepable again. 0 sweeps at every
	 *  checkpoint. */
	sweepIntervalMs: number;
	/** The watch bound: the newest maxWatch entries survive; the oldest is
	 *  dropped (and the drop ledgered) when the bound is exceeded. */
	maxWatch: number;
	/** The optional allowlist of path globs; empty means every path watches. */
	include: string[];
	/** The excluded path globs. */
	exclude: string[];
	/** The check-set table (name -> spec) used to classify watched paths.
	 *  The shipped catalog is Variable/DefaultCheckSets.ts. */
	checksets: Record<string, CheckSet>;
	/** The per-action allowlist (D6) - the shared factory block. This
	 *  package's actions are record (automatic); it has NO gated action, so
	 *  the block documents the posture without refusing anything. A resolved
	 *  pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
