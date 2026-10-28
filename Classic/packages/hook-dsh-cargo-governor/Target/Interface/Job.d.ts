export default interface Job {
    /** Append one output chunk to the job's live log. */
    append(chunk: string): void;
}
