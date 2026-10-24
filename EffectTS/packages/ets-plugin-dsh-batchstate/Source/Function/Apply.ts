// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `batchstate`, constructed here so
// `ctx.batchstate` resolves), the activation proof, and the store recovery.
//
// THE STORE SPLIT (the completion spec's wave 3 storage migration): the KV
// domain (Function/Storage, config `domain`, default `batch_state`) is the
// PRIMARY store - the plugin probes the harness's storage facility once and
// opens the domain in its own effect, closing it on dispose. The well-known
// JSON state file (Function/Recover, config `stateFile`) is the DEGRADED
// FALLBACK, engaged only when no facility is provided (or the open fails).
// Both feed the SAME recovery (Function/Restore), so the byte-exact
// `recovered (<n> members, queue <n>)` line, the honest active ->
// interrupted downgrade and the malformed-row skip are identical.
//
// The contract is BATCH-STATE-PLUGIN.md sections 2 and 7.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
// registers the service (it reads honestly from the empty state), and wires
// NOTHING - no listener, no event, no store.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshBatchstateState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import Inbox from "@Function/Inbox.js";
import Recover from "@Function/Recover.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

/** The storage-domain name rule (the library's UNIT_NAME_RE). */
const UNIT = /^[a-z][a-z0-9_]*$/;

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (runs BEFORE the State build so an invalid
 * config throws at load, never silently defaults). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`batchstate: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["stateFile"]) !== "string" ||
			String(Cell(Raw["stateFile"])).length === 0:
			Fail("stateFile must be a non-empty string");
			break;
		case typeof Cell(Raw["domain"]) !== "string" || !UNIT.test(Cell(Raw["domain"]) as string):
			// The domain name is a storage unit name: a bad one must fail at
			// load, never at the detached open.
			Fail("domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/");
			break;
		case !(
			typeof Cell(Raw["maxRecent"]) === "number" &&
			Number.isInteger(Cell(Raw["maxRecent"])) &&
			(Cell(Raw["maxRecent"]) as number) >= 1
		):
			Fail("maxRecent must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["maxProposals"]) === "number" &&
			Number.isInteger(Cell(Raw["maxProposals"])) &&
			(Cell(Raw["maxProposals"]) as number) >= 1
		):
			Fail("maxProposals must be an integer >= 1");
			break;
		case typeof Cell(Raw["batch"]) !== "string" || String(Cell(Raw["batch"])).length === 0:
			Fail("batch must be a non-empty string");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "batchstate",
		fields: {
			On: "enabled",
			Batch: "batch",
			StateFile: "stateFile",
			DomainName: "domain",
			MaxRecent: "maxRecent",
			MaxProposals: "maxProposals",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	// The live collections: the members map, the idle queue, the completions
	// ring (the State builder creates the shared machinery only - the
	// module's own collections start empty and are repopulated by the store's
	// recovery).
	State.Members = new Map();
	State.IdleQueue = [];
	State.Recent = [];
	// The inbox splice's collections: the spliced proposals, the arbiter
	// gates, and the message-id de-duplication ring (the live emit and the
	// durable splice of one message project once).
	State.Proposals = new Map();
	State.Gates = new Map();
	State.Seen = [];
	// The store's own state: no domain open yet, nothing on the chain, and the
	// JSON fallback as the default until a facility is probed.
	State.Handle = undefined;
	State.Pending = Promise.resolve();
	State.Store = "file";
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("batchstate", this).
	new ServiceClass(Context, State);
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, wired to nothing.
			Factory.Append(State, "disabled (enabled=false)");
			return;
		default:
	}
	// The activation proof (the module's own composed line).
	Factory.Append(
		State,
		Activate([
			["batch", State.Batch],
			["stateFile", State.StateFile],
		]),
	);
	// THE STORE PROBE (the family's P5-style optional facility): the storage
	// hub's domain form first, then the provided storageDomain service.
	// `ctx.get` never throws on a missing service.
	const Facility =
		(Context.get?.("storage") as { domain?: unknown } | undefined)?.domain ??
		Context.get?.("storageDomain");
	switch (true) {
		case !!Facility:
			// The PRIMARY: open the domain on the persistence chain (the open
			// and the recovery land before any write) and close it on dispose.
			State.Store = "pending";
			Context.effect?.(() => {
				State.Pending = State.Pending.then(() => Storage(State, Facility));
				return () => {
					const Handle = State.Handle;
					State.Handle = undefined;
					switch (true) {
						case !!Handle:
							void Handle.close().catch(() => {
								/* close best-effort */
							});
							break;
						default:
					}
				};
			}, "batchstate-storage");
			break;
		default:
			// The FALLBACK: no facility - the JSON state file is the store,
			// read synchronously on mount (the PoC's ordering, unchanged).
			Recover(State);
	}
	// THE INBOX SPLICE (the re-spec's target, D5): the harness agent-team
	// inbox is the channel the batch packages share - the board projects
	// every batch proposal/decision that arrives through it into this state.
	Inbox(State);
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshBatchstateState"] = State;
};
