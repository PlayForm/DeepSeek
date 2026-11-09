/**
 * @module Preview
 *
 * The result of one preview call: the gate evaluation without any write.
 *
 * @remarks
 * The digest is the SHA-256 of the joined
 * intended contents - the digest a later step can verify against what the
 * batch actually wrote (W4.1 section 6, check 4).
 */
export default interface Preview {
	/**
	 * The preview id (caller-supplied or generated `preview-<seq>`).
	 */
	id: string;

	/**
	 * True when every gate and fence passed (the batch is ready).
	 */
	ok: boolean;
	files: {
		/**
		 * The operation's file path.
		 */
		path: string;
		/**
		 * The expected version (the fence).
		 */
		expected: string;
		/**
		 * The observed version on disk.
		 */
		observed: string;
		/**
		 * The content length in bytes.
		 */
		bytes: number;
		/**
		 * `ready` when the fence matches, `conflict` otherwise.
		 */
		status: "ready" | "conflict";
	}[];

	/**
	 * SHA-256 of the joined intended contents (hex).
	 */
	digest: string;

	/**
	 * The gate reason when the batch is not ready.
	 */
	reason?: string;
}
