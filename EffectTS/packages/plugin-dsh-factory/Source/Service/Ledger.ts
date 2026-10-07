// Ledger - the FACTORY'S LEDGER SERVICE (Source/Service/Ledger.ts): the
// `Context.Service` behind the Library's `Append` method. The machinery
// itself is unchanged - Function/Append stays the byte-identical plain-fs
// implementation (logger first, then the durable ledger file via plain
// `appendFileSync`, the documented exemption, never rethrows) - what changes
// is the WRAPPING: the append runs as a TYPED EFFECT wrapped in a
// `dsh.ledger.append` SPAN (Effect v4's tracing hook; the default no-op
// Tracer makes the span zero-cost, an external OTel exporter can pick it up
// later without touching any caller).
//
// Containment lives INSIDE the service: the effect is `Effect.exit`-wrapped,
// so `append` is `Effect<void>` - it can NEVER fail, which is what allows
// the shell's sync boundary (`Effect.runSync` at the Library method) to stay
// non-throwing exactly like the Classic `Append` (the smokes assert "never
// throws" for a bad ledger path and for `Enabled=false`). Every read of the
// State's fields happens at CALL time - the same State object the module
// built - so no snapshot can drift.
//
// The span carries the module identity as a read-only attribute
// (`module`); it never alters the ledger bytes, the logger prefix, or the
// ordering (logger first, then the file - both inside the span).
import { Context, Effect, Layer } from "effect";
import AppendFn from "../Function/Append.js";
import type State from "@Interface/State.js";

// Ledger - the service tag: one method, `append`, the typed ledger writer.
// The tag is a class-style `Context.Service` (the two-stage form): the
// identifier string is the runtime key in the factory's Context.
export class Ledger extends Context.Service<
	Ledger,
	{
		/** The ledger: logger + the durable appendFileSync file, never throws.
		 *  The effect itself is exit-contained (it can never fail). */
		append(State: State, Message: string): Effect.Effect<void>;
	}
>()("dsh.factory.Ledger") {}

// The service implementation: `Layer.succeed` - the machinery is pure
// synchronous code (Function/Append), so acquisition needs no effect; the
// layer exists to make the service a first-class member of the factory's
// Layer graph (Source/Service/Runtime.ts) rather than a bare import.
export const layer = (): Layer.Layer<Ledger> =>
	Layer.succeed(Ledger, {
		append: (State, Message) =>
			// Exit-containment is the OUTERMOST wrapper (defects included), the
			// span inside it; the Classic try/catch structure of Function/Append
			// (logger try/catch, then the Enabled-gated file append try/catch)
			// is untouched, so every byte and every swallow is identical.
			Effect.asVoid(
				Effect.exit(
					Effect.sync(() => AppendFn(State, Message)).pipe(
						Effect.withSpan("dsh.ledger.append", {
							attributes: { module: State.Module },
						}),
					),
				),
			),
	});
