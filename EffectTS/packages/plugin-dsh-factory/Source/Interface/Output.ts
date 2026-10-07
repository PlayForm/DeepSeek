// Output — the successful transform result (Interface/Transform returns this
// or null). `next` is the NEXT content of the governed file: an OBJECT for a
// JSON module (serialized by Function/Continue as JSON.stringify(next, null,
// 2) + "\n" — the trio's exact serialization) or a raw STRING for a
// text-surgery module (written verbatim — the cargo governor's line-level
// edit). `count` is the number of changed items; `count === 0` is treated as
// the designed NO-OP (nothing written, nothing re-emitted, nothing logged by
// the factory). `message` is OPTIONAL — the MODULE'S ledger line for the
// successful rewrite ("pinned <path> (n versions)" / "governed <path> →
// <version>"): the factory never owns ledger strings, so it is supplied
// here — as a plain string (logged verbatim after the guarded write) or as a
// function of the write outcome `{ version }` (for the governor's
// version-bearing line). Returning `null` (or logging inside the transform
// and returning null) is the NO-CHANGE path: the factory stays silent.
import type { FsVersion } from "@deepseek-ai/dsh-fs";

export default interface Output {
	/** The next content — an object (JSON module) or a string (text surgery). */
	next: unknown;
	/** The number of changed items; 0 means the designed no-op. */
	count: number;
	/** The module's ledger line for the successful rewrite, verbatim or
	 *  composed from the service-issued fresh version. */
	message?: string | ((outcome: { version: FsVersion }) => string) | undefined;
}
