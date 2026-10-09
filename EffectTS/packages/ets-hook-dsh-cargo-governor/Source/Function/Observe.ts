// Observe — the fs/observed listener body for the CARGO MODULE (basename
// Cargo.toml), now a THIN COMPOSITION of the @playform/ets-plugin-dsh-factory
// service. The critical path stays AWAIT-FREE and THROW-FREE (a throw inside
// an fs/observed listener fails the tool call AFTER the mutation already
// succeeded): the g1 gate set runs as ONE factory call (Factory.Gate — it
// logs nothing; the module composes its own lines), the registry discovery
// (Factory.Discover / Factory.Parse — exempt plain-fs reads) and the ledger
// lines run inline, and the API-aware stages run DETACHED (the factory's
// Continue for the g3 chain pass, then the module-owned g4 update stage) —
// ctx.fs.readText/writeText are async by contract
// (subsystems/filesystem.md), and the listener must never await. Both stages
// are contained (their own catch) so rejections can never surface as a tool
// error (the silence invariant).
//
// g1 — Factory.Gate (target → actor → kind → idempotent → basename →
//      exclusion; the `excluded` outcome is the one line the module composes:
//      `skipped (excluded) <path>`);
// g2 — governance context (registry walk-up + the two designed skip lines);
// g3 — the factory's Continue with THE TRANSFORM (Function/Transform: the
//      TOML pipeline as a string-next factory transform — the guarded write,
//      the `governed <path> → <version>` line and the P₃ re-emit are the
//      factory's);
// g4 — the update stage (Function/Dispatch → Run → Update/Upgrade), run
//      AFTER the continuation resolves so the ledger order stays
//      byte-identical (`governed …` before `update stage dispatched …`),
//      skipped entirely when Filter finds nothing public for cargo to do.
import { dirname as Parent } from "node:path";
import Transform from "./Transform.js";
import Dispatch from "./Dispatch.js";
import Filter from "./Filter.js";
import { Suppress } from "@playform/ets-hook-dsh-core";
import type State from "@Interface/State.js";
import type RegistryView from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
import type { FsTarget, FsObservation } from "@deepseek-ai/dsh-fs";

export default (
	Factory: PluginFactory,
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
): void => {
	try {
		// g1 — the trigger gate set, as ONE factory call (it logs nothing; the
		// module composes its own lines for the outcomes it cares about — at
		// least the `excluded` one, a module string).
		const Decision = Factory.Gate(State, Target, Observation, Actor, {
			basename: "Cargo.toml",
		});
		switch (true) {
			case Decision.pass:
				break;
			case Decision.reason === "excluded" && !!Decision.path:
				Factory.Append(State, `skipped (excluded) ${Decision.path}`);
				return;
			default:
				return;
		}
		const Path = Decision.path as string;
		const Dir = Parent(Path);

		// Narrowing guard: the gate's pass decision already implies
		// kind === "present" (the g1 order checks kind before basename and
		// exclusion), but the factory call cannot narrow the caller's union —
		// this case restores the narrowing for the Stash seed and the handoff
		// below (unreachable in practice; defense in depth).
		switch (true) {
			case Observation?.kind !== "present":
				return;
		}

		// g2 — governance context: nearest registry.json (walk up), policy
		// (registry discovery stays an EXEMPT plain-fs walk-up — internal
		// calculation on auxiliary files, not the governed manifest).
		const Found = Factory.Discover(Dir);
		let Registry: RegistryView | null = null;
		switch (true) {
			case !!Found:
				Registry = Factory.Parse(Found) as RegistryView;
				break;
		}
		switch (true) {
			case !!Found && !Registry:
				Factory.Append(
					State,
					`unreadable registry.json at ${Found} — chain pass skipped for ${Path}`,
				);
				break;
			case !Found:
				Factory.Append(State, `no registry.json found for ${Path} — chain pass skipped`);
				break;
		}

		// Idempotence gate BEFORE detaching: our own re-emits within the
		// async window hit this and are skipped (the factory's Gate READS the
		// Stash; the caller seeds it — the designed split).
		State.Stash.set(Target.targetKey, Observation.version);

		// The passage cell (the SAME ROLE as the package.json governor's
		// Interface/Passage — the naming unification, P4): the transform records
		// the decoded manifest, the resolved update-policy path and a refusal
		// flag for the update stage below (one decode, one resolution — the
		// pre-refactor single-pass flow; a refusal skips the update stage
		// exactly as before).
		const Passage: Passage = { Manifest: null, Policy: "", Refused: false };
		// g3+g4 — detached, contained, await-free on the listener path. The
		// factory's Continue owns the scaffolding (the in-flight registration,
		// the readText, the union keep-list, the guarded write, the message
		// line, the P₃ re-emit, the throw containment); the update stage runs
		// after it settles so the ledger order is preserved.
		void (async (): Promise<void> => {
			try {
				await Factory.Continue(
					State,
					Target,
					Actor,
					Dir,
					Found,
					Observation.version,
					Transform(Factory, State, Path, Dir, Found, Registry, Passage),
				);
				// g4 — update stage (U): skipped entirely after a rewrite refusal
				// (the pre-refactor flow) and when everything is chain-governed —
				// nothing for cargo to do.
				switch (true) {
					case Passage.Refused:
					case !Filter(Passage.Manifest, Registry):
						return;
				}
				await Dispatch(Factory, State, Target, Actor, Dir, Registry, Passage.Policy);
			} catch (Cause) {
				// Contained: mirror the factory's suppression — logger only, never
				// the ledger, never a rethrow (the CORE's Suppress composer).
				try {
					State.Context.logger.error?.(Suppress(State.Module, "continuation", Cause));
				} catch {
					/* logger optional */
				}
			}
		})();
	} catch (Cause) {
		// NEVER rethrow: a throw inside an fs/observed listener fails the
		// tool call AFTER the mutation already succeeded.
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};
