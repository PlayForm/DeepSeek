// Manual - the service's manual stamp path (Function/Manual): resolve through
// ctx.fs, stat for the version, record with origin "manual", ledger. Unlike
// the listener this path is async (the fs seam is) - it is a deliberate,
// awaited call, not the synchronous recorder.
//
// An ABSENT target is honest: version "absent" (never a fabricated version
// token). A fs failure throws to the caller (the service's async surface may
// reject; the listener's silence invariant does not apply here) - but the
// ledger line still lands first, so the durable record stays complete.
import Record from "@Function/Record.js";
import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";

export default async (State: State, Path: string): Promise<Stamp> => {
	const Target = await State.Context.fs.resolve(Path);
	const Info = (await State.Context.fs.stat(Target)) as { version: string } | undefined;
	const Version = Info !== undefined ? String(Info.version) : "absent";
	State.Sequence += 1;
	State.Factory.Append(State, `manual ${Path} version ${Version}`);
	Record(State, {
		path: Path,
		version: Version,
		origin: "manual",
		sequence: State.Sequence,
	});
	return {
		path: Path,
		version: Version,
		origin: "manual",
		sequence: State.Sequence,
	};
};
