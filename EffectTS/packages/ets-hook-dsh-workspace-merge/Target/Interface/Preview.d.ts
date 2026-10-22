export default interface Preview {
    id: string;
    /** True when every gate and fence passed (the batch is ready). */
    ok: boolean;
    files: {
        path: string;
        expected: string;
        observed: string;
        bytes: number;
        status: "ready" | "conflict";
    }[];
    /** SHA-256 of the joined intended contents (hex). */
    digest: string;
    /** The gate reason when the batch is not ready. */
    reason?: string;
}
