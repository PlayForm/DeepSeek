// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceGovern`), the activation proof,
// and the gate listeners:
//
//   L1  tools/pre-execute  (waterfall, next() first, fail-open envelope):
//       the gate arm - extract the proposal (the operate family's attached
//       record, or the minimal synthesis from the call itself), run the
//       recursion guard, run the four independent means-checks, and return
//       the downstream decision UNCHANGED on pass, the deny decision on
//       deny, and the ask decision on escalate;
//   L2  tools/post-execute (waterfall, plain observer): records the outcome
//       of a gated call in the ledger (`observed <operation> (accepted |
//       errored)`) so the gate's decision trail is auditable per call.
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger line records it and the
// downstream decision is returned UNCHANGED. A gate error never breaks a
// dispatch (per-obligation failures are governed by the recovery table
// instead - Function/Recovery).
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false. A cold mount logs
// `disabled (enabled=false)` and wires NOTHING.
//
// The function returns NOTHING (the loader contract). The test probe is the
// `ctx.__hookDshWorkspaceGovernState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type {
	PostToolDecision,
	PreToolDecision,
	ToolExecution,
	ToolExecutionResult,
} from "@deepseek-ai/dsh-tools";
import Decide from "@Function/Decide.js";
import Extract from "@Function/Extract.js";
import Guard from "@Function/Guard.js";
import Match from "@Function/Match.js";
import ServiceClass from "@Function/Service.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

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
		throw new Error(`govern: ${Message}`);
	};
	switch (true) {
		case !(
			Array.isArray(Cell(Raw["tools"])) &&
			(Cell(Raw["tools"]) as unknown[]).every((Item) => typeof Item === "string")
		):
			Fail("tools must be an array of tool names");
			break;
		case !(Array.isArray(Cell(Raw["scope"])) && Array.isArray(Cell(Raw["exclude"]))):
			Fail("scope and exclude must be arrays");
			break;
		case !Array.isArray(Cell(Raw["policy"])):
			Fail("policy must be an array of rules");
			break;
		case !(Cell(Raw["policy"]) as { kind?: unknown }[]).every(
			(Rule) => Rule !== null && typeof Rule === "object" && typeof Rule.kind === "string",
		):
			Fail("every policy rule needs a kind string");
			break;
		case !Array.isArray(Cell(Raw["recovery"])):
			Fail("recovery must be an array of overrides");
			break;
		case !(Cell(Raw["recovery"]) as { obligation?: unknown; behavior?: unknown }[]).every(
			(Rule) =>
				Rule !== null &&
				typeof Rule === "object" &&
				typeof Rule.obligation === "string" &&
				typeof Rule.behavior === "string" &&
				["fail-open", "fail-closed"].includes(Rule.behavior),
		):
			Fail(
				'every recovery override needs obligation ∈ {contributes, scope, policy, preconditions} and behavior ∈ {"fail-open", "fail-closed"}',
			);
			break;
		case !(
			typeof Cell(Raw["loopBound"]) === "number" && (Cell(Raw["loopBound"]) as number) >= 1
		):
			Fail("loopBound must be >= 1");
			break;
		case !(
			typeof Cell(Raw["maxDecisions"]) === "number" &&
			(Cell(Raw["maxDecisions"]) as number) >= 1
		):
			Fail("maxDecisions must be >= 1");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "govern",
		fields: {
			On: "enabled",
			Tools: "tools",
			Scope: "scope",
			Exclude: "exclude",
			PolicyRules: "policy",
			RecoveryRules: "recovery",
			LoopBound: "loopBound",
			MaxDecisions: "maxDecisions",
		},
	}) as State;
	State.Factory = Factory;
	State.Decisions = [];
	State.Recent = new Map();
	State.Sequence = 0;
	State.Self = { plugin: "hook-dsh-workspace-govern" };
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceGovern", this).
	const Append = (Message: string): void => {
		Factory.Append(State, Message);
	};
	new ServiceClass(Context, State, Append);
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
			["tools", String(State.Tools.length)],
			["policy", String(State.PolicyRules.length)],
		]),
	);
	// The gate arm: tools/pre-execute.
	Context.on(
		"tools/pre-execute",
		async (
			Exec: ToolExecution,
			Next: () => Promise<PreToolDecision>,
		): Promise<PreToolDecision> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On) {
					return Downstream;
				}
				if (State.Tools.length > 0 && !State.Tools.includes(Exec.name)) {
					return Downstream;
				}
				if (Exec.agent === State.Self) {
					// The hook's own activity is never gated.
					return Downstream;
				}
				const Proposal_ = Extract(Exec);
				if (Proposal_.target !== "(none)" && Match(Proposal_.target, State.Exclude)) {
					// Excluded targets are never gated, in silence.
					return Downstream;
				}
				if (Guard(State, Proposal_.operation, Append)) {
					return Downstream;
				}
				const Decision = Decide(State, Proposal_, Append);
				switch (true) {
					case Decision.decision === "deny":
						return { kind: "deny", reason: `govern: ${Decision.reason}` };
					case Decision.decision === "escalate":
						return { kind: "ask", reason: `govern: ${Decision.reason}` };
					default:
						return Downstream;
				}
			} catch (Error) {
				// Fail-open: a gate error never breaks a dispatch.
				try {
					Context.logger?.warn(`govern: ${String(Error)}; the dispatch passes through`);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);
	// The outcome observer: tools/post-execute.
	Context.on(
		"tools/post-execute",
		async (
			Exec: ToolExecution,
			Result: Readonly<ToolExecutionResult>,
			Next: () => Promise<PostToolDecision>,
		): Promise<PostToolDecision> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On || !State.Tools.includes(Exec.name)) {
					return Downstream;
				}
				const Operation = `op:${String(Exec.callId ?? "(unknown)")}`;
				const Errored = (Result as { success?: boolean } | undefined)?.success === false;
				Factory.Append(
					State,
					`observed ${Operation} (${Errored ? "errored" : "accepted"})`,
				);
				return Downstream;
			} catch (Error) {
				// Fail-open: the observer never breaks a waterfall.
				try {
					Context.logger?.warn(`govern: ${String(Error)}; the outcome is not recorded`);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceGovernState"] = State;
};
