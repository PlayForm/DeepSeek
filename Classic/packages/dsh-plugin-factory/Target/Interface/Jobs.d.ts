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
            append(text: string, options?: {
                label?: string;
            }): void;
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
