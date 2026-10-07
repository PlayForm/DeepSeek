// Jobs — the probed view of the DSH jobs service (the root-level runtime).
// The service is NEVER injected: it is optional, and on contexts without a
// job controller the direct `ctx.jobs` accessor can throw — the documented
// optional-dep probe is `ctx.get(name)` (live-verified 2026-10-03, the same
// lesson as `ctx.subprocess`), with today's detached contained continuation
// as the fallback (Function/Dispatch). The service is not part of the
// published @deepseek-ai/cordis typings, so the shapes the plugin consumes
// are mirrored here structurally.
import type Job from "@Interface/Job.js";

export default interface Jobs {
	/** Register this plugin as a root-level job controller (Function/Apply). */
	attachController(name: string): unknown;
	/** Start one background job. `run` receives the Job handle and returns the
	 *  cancel/done pair; `done` NEVER rejects — it resolves the settled
	 *  outcome (`status`/`detail`), exactly the semantics of the detached
	 *  continuation's settlement chain (Function/Dispatch). */
	start(request: {
		/** The job kind — "governor-update" for the update stage. */
		kind: string;
		/** Human-facing label — `cargo upgrade <dir>`. */
		label: string;
		/** The owning agent context — a root plugin owns NOTHING: the owner KEY
		 *  is OMITTED (the uniform governor-family envelope — exactOptional
		 *  PropertyTypes allows the omission; an explicit `owner: undefined`
		 *  would differ from the parent governor's `!("owner" in job)` form). */
		owner?: unknown;
		run: (job: Job) => {
			/** Cancel the run — aborts the task-owned signal (Function/Run). */
			cancel: () => void;
			/** The never-rejecting settlement promise. */
			done: Promise<{ status: string; detail: string }>;
		};
	}): unknown;
}
