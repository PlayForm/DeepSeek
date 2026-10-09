// Write - the SHARED WRITE-EXECUTOR SERVICE (Source/Service/Write.ts): the
// `Context.Service` behind the Library's `Write` and `GuardedWrite` methods.
// The family's ONE shared write executor - the Over bundle, the P4 fence,
// the Stash pre-registration, the root-emit with the wrapped-actor marker
// and the observe flag - stays ONE implementation: the effect body is
// Function/Write.ts (re-expressed from the Classic promise chain), this
// service gives it its typed identity and the `dsh.write` span.
//
// The span: `dsh.write` rooted at the target path, with the resolved intent
// and policy posture added as read-only attributes via
// `Effect.annotateCurrentSpan` (extra facts per the plan; the default
// no-op Tracer makes them free). Spans never alter ordering, timing or
// ledger strings.
//
// The error channel is `unknown`: a failed write rejects the caller's
// promise exactly like the Classic (`Effect.runPromise` at the shell's
// boundary turns the typed failure into a rejection) - EXCEPT on the
// continuation path, where Function/Continue wraps the whole chain and
// keeps the family's silence invariant. The wrapped-actor marker lives on
// the actor itself (`govern` - the raw-write's marker): the executor passes
// the actor through verbatim to the waterfall and the root-emit, and the
// Gate's second check is what honors it - the executor never mutates an
// actor, so the Gate matrix and the emitted events stay byte-identical.
import { Context, Effect, Layer } from "effect";
import WriteFn from "../Function/Write.js";
import type { Over } from "../Function/Write.js";
import type State from "@Interface/State.js";
import type { FsTarget, FsWriteOutcome } from "@deepseek-ai/dsh-fs";

// Write - the service tag.
export class Write extends Context.Service<
	Write,
	{
		/** The ONE shared write executor: the Over bundle (intent/signal/policy/
		 *  actor/observe/stash/transform) resolved inside the effect. Fails with
		 *  the underlying seam's error (unknown) - the callers own containment. */
		write(
			State: State,
			Target: FsTarget,
			Content: string,
			Over?: Over,
		): Effect.Effect<FsWriteOutcome, unknown>;
	}
>()("dsh.factory.Write") {}

// The service implementation: `Layer.succeed` - the executor is pure
// orchestration over plain seams (no acquisition), so no `Layer.effect`.
export const layer = (): Layer.Layer<Write> =>
	Layer.succeed(Write, {
		write: (State, Target, Content, Over) =>
			WriteFn(State, Target, Content, Over ?? {}).pipe(
				Effect.withSpan("dsh.write", { attributes: { target: Target.displayPath } }),
			),
	});
