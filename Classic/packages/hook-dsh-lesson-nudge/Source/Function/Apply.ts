// Apply - the plugin entry function: the State build, the activation proof, and
// the ONE listener of the nudge's surface.
//
// THE SURFACE IS `agent/status` (emit, idle <-> running). The idle edge is the
// only moment a review may run: the turn is over, the driver is quiescent, and
// `agent.runMaintenance` exists precisely to claim that phase for non-turn work.
// Reviewing on any other edge would put a second model call beside the live
// turn's - the exact contention the Hermes review avoids by forking after the
// turn and deferring on a shared endpoint.
//
// THE FOUR GATES, in order, cheapest first:
//
//   1. the switch (`enabled`), so a disabled hook costs one comparison;
//   2. the edge (`status === "idle"`);
//   3. the service (`ctx.lesson`, probed per transition - the service may load
//      after this hook, and a missing service is a WARN, never a throw into an
//      emit);
//   4. the cadence (`Lesson.Tick(agent).due`) and the hook's own cap
//      (`maxReviewsPerSession`, the runaway guard for a mis-set interval).
//
// FAIL-OPEN, ALWAYS: every body is one try/catch. A status listener that throws
// breaks the harness's status publication, which is a far worse outcome than a
// skipped review - so the catch warns and returns.
//
// THE SNAPSHOT COMES FROM THE SERVICE (`Lesson.Snapshot(agent)`), not from this
// hook: the projection of a live session into messages is the review package's
// integration seam, and duplicating it here would give the same session two
// different digests depending on who asked.
import type { Context } from "@deepseek-ai/cordis";
import { Activate } from "@playform/lib-dsh-core";

import type {} from "../Interface/Agent.js";
import type {} from "../Interface/Factory.js";

import type Config from "../Interface/Config.js";
import type State from "../Interface/State.js";

/** The bundle version, mirrored from package.json (the activation proof). */
const Version = "0.3.0";

/** The lesson service surface this hook consumes (structural, not imported). */
interface Lesson {
	Tick: (Agent: unknown) => { due: boolean; count: number } | undefined;
	Snapshot: (Agent: unknown) => unknown[];
	Review: (Input: {
		Agent?: unknown;
		Session?: string;
		Messages: unknown[];
		Signal?: AbortSignal;
	}) => Promise<{ outcome: string; applied: string[]; proposed: string[] }>;
}

/** The status payload (`agent/status`). */
interface StatusPayload {
	agent?: unknown;
	status?: string;
}

/** The session id, probed defensively (the agent may not expose one). */
const Session = (Agent: unknown): string | undefined => {
	const Id = (Agent as { session?: { id?: unknown } } | undefined)?.session?.id;
	return typeof Id === "string" && Id !== "" ? Id : undefined;
};

export default (Context: Context, Options: Config): void => {
	// The State: the factory's shared shape plus the nudge's own fields, copied
	// from the (cell-unwrapped) validated config by the setup map. Every volatile
	// field refreshes in place via the factory's loader listener.
	const Factory = Context.pluginFactory;
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-lesson-nudge",
		fields: {
			On: "enabled",
			Cap: "maxReviewsPerSession",
		},
	});
	State.Factory = Factory;
	State.Reviews = new Map();
	State.Warned = false;

	/** The ledger append (the factory's Append, fail-safe). */
	const Append = (Message: string): void => {
		try {
			State.Factory.Append(State, Message);
		} catch (Error) {
			try {
				Context.logger?.warn(
					`hook-dsh-lesson-nudge: ${String(Error)}; the ledger line is dropped`,
				);
			} catch {
				/* logger optional */
			}
		}
	};

	/** The one-shot warn (a missing service is a warn per process, not per turn). */
	const Warn = (Message: string): void => {
		try {
			Context.logger?.warn(`hook-dsh-lesson-nudge: ${Message}`);
		} catch {
			/* logger optional */
		}
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone:
	//   hook-dsh-lesson-nudge: activated (bundle=0.3.0, cap=3)
	Append(
		State.On
			? Activate([
					["bundle", Version],
					["cap", `${State.Cap}`],
				])
			: "disabled (enabled=false)",
	);

	// ------------------------------------------------------------------
	// The listener: agent/status - the idle edge.
	// ------------------------------------------------------------------
	Context.on("agent/status", (Payload: StatusPayload) => {
		try {
			switch (true) {
				case !State.On:
					return;
				case Payload?.status !== "idle":
					return;
				case Payload.agent === undefined:
					return;
				default:
					break;
			}
			const Agent = Payload.agent;
			// Probed per transition: the review service may load after this hook.
			const Lesson = Context.get?.("lesson") as Lesson | undefined;
			switch (true) {
				case Lesson === undefined || typeof Lesson.Tick !== "function":
					switch (true) {
						case State.Warned:
							break;
						default:
							State.Warned = true;
							Warn("no lesson service; the nudge is inert until it loads");
					}
					return;
				default:
					break;
			}
			const Tick = Lesson.Tick(Agent);
			switch (true) {
				case Tick === undefined || Tick.due !== true:
					return;
				default:
					break;
			}
			// The hook's own runaway guard: a mis-set service interval must not
			// turn every idle edge into a review.
			const Done = State.Reviews.get(Agent) ?? 0;
			switch (true) {
				case Done >= State.Cap:
					Append(`cap reached (${Done} reviews)`);
					return;
				default:
					break;
			}
			const Run = (Agent as { runMaintenance?: unknown }).runMaintenance;
			switch (true) {
				case typeof Run !== "function":
					Append("skipped (agent cannot run maintenance)");
					return;
				default:
					break;
			}
			State.Reviews.set(Agent, Done + 1);
			const Task = (
				Run as (Task: (Signal: AbortSignal) => Promise<unknown>) => Promise<unknown>
			).call(Agent, async (Signal: AbortSignal) => {
				const Messages = Lesson.Snapshot(Agent);
				const Result = await Lesson.Review({
					Agent,
					Messages,
					Signal,
					...(Session(Agent) === undefined ? {} : { Session: Session(Agent) as string }),
				});
				Append(
					`reviewed ${Result.outcome} (${Result.applied.length} applied, ${Result.proposed.length} queued)`,
				);
				return Result;
			});
			// The maintenance task is detached from the emit: a status listener
			// must return immediately, and its rejection must not become an
			// unhandled rejection.
			void Promise.resolve(Task).catch((Cause: unknown) => {
				Warn(`review task failed: ${(Cause as Error)?.message ?? String(Cause)}`);
			});
		} catch (Error) {
			// Fail-open: never throw into a status emit.
			Warn(`${String(Error)}; the transition passes unnudged`);
		}
	});

	// The loader ignores any return value; the end-phase smoke probes the built
	// State through this debug attachment instead.
	(Context as { __hookDshLessonNudgeState?: State }).__hookDshLessonNudgeState = State;
};
