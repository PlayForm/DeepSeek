// Refresh — the P₃/U₂ observation-policy refresh (Function/Refresh in the
// service API): register the version token and RE-EMIT `fs/observed` with the
// SAME actor so the observation-policy's per-owner CAS record stays in sync —
// the author's next guarded write/edit does not fail FS_STALE_VERSION (a
// notification leak). Same actor ⇒ same owner bucket. Best-effort: any
// failure is swallowed here.
//
// The version is supplied by the caller: the fresh token from
// Function/Write's outcome, or — for the update-engine variant (the trio's
// stat-based Function/Refresh after ncu/cargo mutated the file) — the
// caller stats first (`ctx.fs.stat(Target)`) and passes the stat's version.
// The token is never computed or parsed locally.
import type { State as State } from "@playform/ets-base-dsh";
import type { Actor as Actor } from "@playform/ets-base-dsh";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

export default (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): void => {
	try {
		State.Stash.set(Target.targetKey, Version);
		State.Context.emit(
			"fs/observed",
			Target,
			{ kind: "present", version: Version },
			(Actor as Actor | undefined) ?? undefined,
		);
	} catch {
		/* U₂ best-effort */
	}
};
