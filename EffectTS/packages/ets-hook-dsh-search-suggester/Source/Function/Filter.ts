// Filter - the BASE-AWARE workspace filter over the detections: each intent's
// candidate set is reduced to the targets that exist under any of the call's
// three bases (the repo root, the package root, the package parent), BEFORE
// the score/gate step (the runner-up intent too, since a close second folds
// into the same note). An intent whose whole candidate set is absent survives
// as a detection with zero targets, and Score turns that into the
// `no-companions` abstention.
import type { Detection, Intent } from "../Interface/Execution.js";
import Exists from "./Exists.js";

/** One intent with only the candidates that exist under a base. */
const Reduce = (
	Intent: Intent,
	CallPath: string,
	Root: string,
	Cwd: string | undefined,
): Intent => ({
	...Intent,
	targets: Intent.targets.filter((Target) => Exists(Target.path, CallPath, Root, Cwd)),
});

export default (
	/** The ranked detections (Detect's output). */
	Detections: Detection[],
	/** The call path the pack is judged against. */
	CallPath: string,
	/** The resolved workspace root (the gate's root). */
	Root: string,
	/** The session cwd, when the harness service exposes one. */
	Cwd: string | undefined,
): Detection[] =>
	Detections.map((Detection) => ({
		...Detection,
		intent: Reduce(Detection.intent, CallPath, Root, Cwd),
		...(Detection.second === undefined
			? {}
			: { second: Reduce(Detection.second, CallPath, Root, Cwd) }),
	}));
