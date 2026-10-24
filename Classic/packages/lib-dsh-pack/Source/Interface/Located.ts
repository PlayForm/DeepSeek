// Located - the workspace gate's answer: the root whose pack signature
// matched, and the resolved pack itself (the caller selects its domain's
// families from it). `undefined` from the locator is the honest silence: no
// pack, no signature, no note.
import type Pack from "./Pack.js";

export default interface Located {
	/** The workspace root (the first ancestor whose pack signature matched). */
	root: string;
	/** The resolved pack for that root (the built-in pack when no file exists). */
	pack: Pack;
}
