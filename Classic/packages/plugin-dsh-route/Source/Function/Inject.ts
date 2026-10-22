// Inject - the silent injection listener on the LAUNCH path
// (ROUTING-ENFORCER-PLUGIN.md section 2.2): a tools/pre-execute waterfall
// listener that intercepts the `subagent` tool (the launch path in the
// current harness - the subagent tool's agentOptions carry provider / model
// / reasoningEffort ONLY) and silently resolves + injects the route per the
// user's policy.
//
// THE SILENCE CONTRACT: no warning, no error, no reminder. The orchestrator's
// call succeeds exactly as if it had passed the right values; the orchestrator
// NEVER sees the model configuration. The only record is the plugin's own
// ledger line (section 2.3): the launch, the task type, the resolved triple,
// and the explicit-or-resolved / corrected-or-kept flag.
//
// THE WATERFALL DISCIPLINE: next() is awaited FIRST; the listener is
// fail-open - on any error a logger.warn records it and the downstream
// decision is returned UNCHANGED. A routing failure never breaks a launch.
// The mutation is in-place on the exec's arguments (the same pattern the
// live-containers wave-2 detach listener uses for tagged execs), so the
// downstream dispatch sees the injected route.
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import ResolveFn from "@Function/Resolve.js";
import type Request from "@Interface/Request.js";
import type Route from "@Interface/Route.js";
import type State from "@Interface/State.js";

/** The launch fields of the subagent tool's execution, loosely typed (the
 * agentOptions vocabulary is the harness's: provider/model/reasoningEffort/
 * maxTokens, plus the prompt/description pair for the inference). */
interface Launch {
	agentOptions?:
		| {
				provider?: string;
				model?: string;
				reasoningEffort?: string;
		  }
		| undefined;
	prompt?: string | undefined;
	description?: string | undefined;
	provider?: string | undefined;
	model?: string | undefined;
	reasoningEffort?: string | undefined;
}

/** The ledger line (the audit format, section 2.3 + exploration item 5).
 * Byte-stable template: `route <taskType> <source> <provider> <model> <effort>`. */
export const LedgerLine = (Route_: Route): string =>
	`route ${Route_.taskType} ${Route_.source} ${Route_.provider} ${Route_.model} ${Route_.reasoningEffort}`;

export default async (
	State: State,
	Exec: ToolExecution,
	Next: () => Promise<PreToolDecision>,
	Append: (Message: string) => void,
): Promise<PreToolDecision> => {
	// next() FIRST: the downstream listeners settle before any decision.
	const Downstream = await Next();
	try {
		if (!State.On) {
			return Downstream;
		}
		if (Exec.name !== "subagent") {
			return Downstream;
		}
		// The launch request, read loosely from the exec's arguments (the
		// subagent tool's payload shape; unknown fields are simply absent).
		const Args = (Exec as unknown as { args?: Launch }).args ?? {};
		const Options = Args.agentOptions ?? Args;
		const Request_: Request = {
			spec: [Args.description, Args.prompt].filter(Boolean).join(" "),
			route:
				Options.provider !== undefined ||
				Options.model !== undefined ||
				Options.reasoningEffort !== undefined
					? {
							provider: Options.provider,
							model: Options.model,
							reasoningEffort: Options.reasoningEffort,
						}
					: undefined,
		};
		const Resolved = ResolveFn(Request_, State.RoutePolicy, State.DefaultRole, State.Keywords);
		// The silent injection: write the resolved triple back into the launch.
		// agentOptions is mutated when present; otherwise the top-level fields
		// are (the subagent tool accepts both spellings).
		if (Args.agentOptions !== undefined) {
			Args.agentOptions.provider = Resolved.provider;
			Args.agentOptions.model = Resolved.model;
			Args.agentOptions.reasoningEffort = Resolved.reasoningEffort;
		} else {
			(Args as Launch).provider = Resolved.provider;
			(Args as Launch).model = Resolved.model;
			(Args as Launch).reasoningEffort = Resolved.reasoningEffort;
		}
		Append(LedgerLine(Resolved));
		return Downstream;
	} catch (Error) {
		// Fail-open: the routing never breaks a launch (the silence contract).
		try {
			State.Context?.logger?.warn(
				`plugin-dsh-route: ${String(Error)}; the launch passes through unrouted`,
			);
		} catch {
			/* logger optional */
		}
		return Downstream;
	}
};
