export default interface Candidate {
    /** The path the change set touches (the model-facing form). */
    path: string;
    /** The content fingerprint of the exact change set (the caller computes
     *  it - the graph owns content hashes; the approve only binds). */
    fingerprint: string;
    /** The file version observed when the candidate was prepared. */
    version: string;
    /** The constraints that travel with the approval (at least one when
     *  config `requireConstraints` is true). */
    constraints: string[];
    /** The human-readable summary of the change set. */
    summary: string;
}
