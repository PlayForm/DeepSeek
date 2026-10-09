// Jobs — the minimal structural type of the harness JobRegistry seam
// (`ctx.jobs`, subsystems/jobs.md), probed at runtime and never injected
// (`ctx.jobs` is agent-scoped; a root plugin probes it as an optional
// dependency). The spec/handle/hooks/outcome shapes are inlined structurally:
// only the members the governor consumes are declared — `attachController`
// (the controller registered from the ROOT context serves every owner —
// registrations made from an unscoped context are owner-relative, jobs.md —
// which is exactly how a root-level update stage becomes registerable) and
// `start` (the synchronous starter contract; the returned id is opaque).
//
// The `kind` string is the producer-kind namespace ("governor-update"); the
// JobKind map is merge-extensible host-side, so the governor declares it as a
// plain string (loose typing, documented here) instead of declaration-merging
// a kind it does not own.
export default interface Jobs {
	/**
	 * Attach an effect-scoped controller that can read and stop jobs; returns
	 * the disposer that detaches it. Duplicate names stay independent.
	 */
	attachController(name: string): () => void;
	/**
	 * Preflight, then atomically register the work and call `run` with the
	 * job's producer face; returns the registry-issued `<kind>-N` id.
	 */
	start(spec: {
		/** Producer kind — also the id prefix. */
		kind: string;
		/** One-line label (the update stage's `ncu <dir>`). */
		label: string;
		/** Owning session; `undefined` creates an unowned job open to any caller. */
		owner?: string;
		/** Synchronous starter; a throw leaves nothing registered. */
		run(job: {
			/** Append one chunk to the job's output ring. */
			append(text: string, options?: { label?: string }): void;
		}): {
			/** Request termination; synchronous, idempotent, eventually settles done. */
			cancel(reason?: string): void;
			/** Terminal outcome; must not reject. */
			done: Promise<{
				status: "completed" | "killed" | "failed";
				detail?: string;
				result?: string;
			}>;
		};
	}): string;
}
