// Continue — the DETACHED CONTAINED continuation of the fs/observed pass
// (Function/Continue in the service API). Everything the API owns is async,
// so this stage lives off the listener: the listener (the module's Observe,
// wired through Function/Wire) stays await-free, and every throw is contained
// — this function's rejections can never surface as a tool error (the
// silence invariant). Identical architecture to the trio's Function/Continue;
// the MODULE-SPECIFIC content step is the supplied pure transform
// (Interface/Transform), everything else is scaffolding owned here.
//
// Lifecycle, exactly:
//   1. register the pass's abort controller in State.Inflight (P2: an unload
//      aborts it mid-flight; removed in the finally below);
//   2. read the file through `ctx.fs.readText(Target, signal)` (subsystems/
//      filesystem.md: the target object from the observed event is reusable;
//      a failed read yields null — e.g. the file vanished);
//   3. compute the union keep-list: the registry-adjacent discovery
//      (Function/Resolve) with the P3 chain-keys union (the keys of the
//      discovered registry.json's `effectiveLatest` — an AUXILIARY discovery
//      read, the standing exemption);
//   4. call the MODULE'S transform (current = the raw text, section = the
//      module's own `Section` state field, keep = the union keep-list);
//      `null` (or `count === 0`) is the designed NO-OP — the factory logs
//      nothing, the module logged its own line inside the transform;
//   5. serialize the next content (a string verbatim — the cargo governor's
//      text surgery; anything else JSON.stringify(next, null, 2) + "\n" —
//      the trio's exact serialization) and perform the guarded write
//      (Function/Write: replaceIfVersion intent, the sandbox-mode-decided
//      fence, Stash pre-registration). The intent's version is the FRESH
//      stat of the target (the U₂ read-only probe), NOT the observed
//      version of the triggering event — the observed version is only the
//      stat-failure fallback. Why: the direct-govern sequential fold hands
//      the same observed version to every registered step, so a later
//      step's chain write against it fails FS_STALE_VERSION once an
//      earlier step's write has advanced the file; writing against the
//      current version lets the fold converge in any step order;
//   6. log the module's ledger line when the transform supplied one
//      (Interface/Output.message — verbatim or composed from the outcome's
//      fresh version);
//   7. re-emit fs/observed with the same actor (Function/Refresh — the P₃
//      stale-version leak fix);
//   8. every throw is contained: the logger-only suppression line
//      (`<module>: continuation error (suppressed): …`) — never the ledger,
//      never a rethrow.
import Append from "./Append.js";
import Parse from "./Parse.js";
import Refresh from "./Refresh.js";
import Resolve from "./Resolve.js";
import Write from "./Write.js";
import type State from "@Interface/State.js";
import type Transform from "@Interface/Transform.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

export default async (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Dir: string,
	Found: string | null,
	Version: FsVersion,
	Transform: Transform,
): Promise<void> => {
	// P2 — the detached pass's abort controller, registered for disposal and
	// removed in the finally below (fiber unload / HMR aborts running work).
	const Control = new AbortController();
	State.Inflight.set(String(Target.targetKey), { controller: Control });
	try {
		let Text: string | null = null;
		try {
			Text = await State.Context.fs.readText(Target, Control.signal);
		} catch {
			/* unreadable (e.g. vanished): handed to the transform as null */
		}
		// The P3 chain keys: the discovered registry's effectiveLatest names —
		// an AUXILIARY discovery read (the standing exemption; the governed
		// manifest is never touched on this path).
		const Chain = Object.keys(
			(Found
				? ((Parse(Found) as { effectiveLatest?: Record<string, unknown> } | null) ?? null)
				: null
			)?.effectiveLatest ?? {},
		);
		// The module's own `Section` state field, when it mapped one. The
		// module's content step — every no-op path (undecodable content, no
		// change, refused rewrite) is a `null` return, already logged by the
		// transform itself; the factory stays silent.
		const Outcome = Transform(
			Text,
			(State as unknown as Record<string, unknown>)["Section"],
			Resolve(State, Dir, Found, Chain),
		);
		switch (true) {
			case !Outcome:
				return;
		}
		switch (true) {
			case Outcome.count === 0:
				return; // the designed no-op
		}
		// Serialize: a string verbatim (text surgery); anything else is a JSON
		// object — the trio's exact serialization. The write goes through the
		// shared executor with the GUARDED composition: the explicit
		// replaceIfVersion intent, the P4 fence, the Stash pre-registration —
		// and observe: false, the re-emit is the module-scope, same-actor
		// Refresh below. The intent's version is the CURRENT version (the
		// fresh-stat basis, the U₂ stat pattern — see the probe below), NOT the
		// version observed by the triggering event: in the direct-govern
		// sequential fold (Factory.Govern) the observed version is handed to
		// every registered step, the first step's chain write advances the file,
		// and every LATER step writing against that stale observed version
		// failed FS_STALE_VERSION (silently — the contained catch; no ledger
		// line, no write), aborting the fold. Writing against a fresh stat makes
		// the fold converge in ANY step order: each step reads the file,
		// transforms, stats, and writes against the version it just observed.
		// The stat is a read-only probe (the standing exemption); when it fails
		// (the file vanished etc.) the observed version stays the fallback.
		let Current: FsVersion = Version;
		try {
			Current = (await State.Context.fs.stat(Target, Control.signal))?.version ?? Version;
		} catch {
			/* read-only probe failed: the observed version remains the fallback */
		}
		const Written = await Write(
			State,
			Target,
			typeof Outcome.next === "string"
				? Outcome.next
				: JSON.stringify(Outcome.next, null, 2) + "\n",
			{
				intent: { kind: "replaceIfVersion", version: Current },
				signal: Control.signal,
				policy: "p4",
				stash: true,
				observe: false,
			},
		);
		// The module's ledger line for the successful rewrite — verbatim, or
		// composed from the service-issued fresh version.
		switch (true) {
			case typeof Outcome.message === "function":
				Append(State, Outcome.message({ version: Written.version }));
				break;
			case typeof Outcome.message === "string":
				Append(State, Outcome.message);
				break;
		}
		// keep the observation-policy's CAS basis coherent (the stale-version
		// leak fix). Same actor ⇒ same owner bucket.
		Refresh(State, Target, Actor, Written.version);
	} catch (Cause) {
		// Contained continuation: mirror the listener's suppression — logger
		// only, never the ledger, never a rethrow.
		try {
			State.Context.logger.error?.(
				`${State.Module}: continuation error (suppressed): ${(Cause as Error)?.message ?? Cause}`,
			);
		} catch {
			/* logger optional */
		}
	} finally {
		State.Inflight.delete(String(Target.targetKey));
	}
};
