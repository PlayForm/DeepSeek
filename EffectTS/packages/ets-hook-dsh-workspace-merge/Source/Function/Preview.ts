// Preview - the no-write evaluation of a batch (Function/Preview): the
// atomic gates (Function/Gate) plus the digest of the intended contents.
// Nothing is written, ever; a caller previews, then commits the same
// operations, and the applied bytes are verified against the intended
// content per file (Function/CommitOne).
import Digest from "@Function/Digest.js";
import Gate from "@Function/Gate.js";
import type Batch from "@Interface/Batch.js";
import type Preview from "@Interface/Preview.js";
import type State from "@Interface/State.js";

export default async (State: State, Request: Batch): Promise<Preview> => {
	const Operations = Array.isArray(Request.operations) ? Request.operations : [];
	const Checked = await Gate(State, Operations);
	const Id =
		typeof Request.id === "string" && Request.id.length > 0
			? Request.id
			: `preview-${State.Sequence + 1}`;
	return {
		id: Id,
		ok: Checked.ok,
		files: Checked.files.map((File) => ({
			path: File.path,
			expected: File.expected,
			observed: File.observed,
			bytes: File.bytes,
			status: File.conflict ? "conflict" : "ready",
		})),
		digest: Digest(Operations.map((Op) => Op.content)),
		...(Checked.reason === undefined ? {} : { reason: Checked.reason }),
	};
};
