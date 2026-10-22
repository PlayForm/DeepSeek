// Preview - the result of one preview call (Interface/Preview): the gate
// evaluation without any write. The digest is the SHA-256 of the joined
// intended contents - the digest a later step can verify against what the
// batch actually wrote (W4.1 section 6, check 4).
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
