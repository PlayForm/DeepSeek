// State - the hook's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the hook's own fields.
//
// Module is "monitor" - the module-owned ledger lines are `monitor: ...`
// (the byte-stable contract), and the factory's Append prefixes with
// `<State.Module>: `. The npm identity lives in the package name and the
// `name` export (hook-dsh-workspace-monitor); the ledger prefix is the
// module's OWN contract string.
import type CheckSet from "@Interface/CheckSet.js";
import type FactoryHandle from "@Interface/Factory.js";
import type WatchEntry from "@Interface/WatchEntry.js";
import type { State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** Config `enabled` - the master switch (volatile; the State builder's
	 *  mapped `On` field). */
	On: boolean;
	/** Config `domain` - the KV domain name reserved for the hook (volatile). */
	DomainName: string;
	/** Config `debounceMs` - the watch-to-sweep window (volatile). */
	DebounceMs: number;
	/** Config `sweepIntervalMs` - the sweep cadence (volatile). */
	SweepIntervalMs: number;
	/** Config `maxWatch` - the watch bound (volatile). */
	MaxWatch: number;
	/** Config `include` - the optional allowlist (volatile; empty = all). */
	Include: string[];
	/** Config `checksets` - the classification table (volatile). */
	CheckSets: Record<string, CheckSet>;
	/** The injected factory instance (the State builder, the ledger, the
	 *  match, the Wire). */
	Factory: FactoryHandle;
	/** The watch map: path -> entry, insertion ordered (the oldest entry is
	 *  the first map entry, so the cap drops from the head). */
	Watch: Map<string, WatchEntry>;
	/** Performance counters: fs/observed events seen (after the guards). */
	Events: number;
	/** Performance counters: sweep passes run. */
	Sweeps: number;
	/** Performance counters: the clock stamp of the last sweep pass
	 *  (undefined until the first). */
	LastSweepAt: number | undefined;
	/** The clock override (the smoke's fake clock; production leaves it
	 *  undefined and the Clock falls back to Date.now()). */
	Now?: () => number;
	/** The hook's OWN actor marker: an fs/observed event carrying exactly
	 *  this object as its actor is the hook's own and is ignored. */
	Self: object;
}

export default interface State extends Base, Extra {}
