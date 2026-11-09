/**
 * @module Corpus
 *
 * The judge's read-only view of the catalog.
 *
 * @remarks
 * The judge is a pure function of (operation, corpus), so it takes this narrow view
 * rather than a path: the service implements it over `ctx.skills` and the fence, and
 * the smokes implement it over a literal map, which is what lets every rule be asserted
 * without touching a filesystem. Nothing here writes, and no method returns a promise,
 * because a judge rule that could wait is a judge rule whose refusal can arrive after
 * the write it was meant to stop.
 *
 * `carried` is separate from `body` on purpose: the first is what the confirm prompt
 * showed the model, the second is what the disk holds now, and the difference between
 * them is the drift the fence refuses.
 */
import type UsageRecord from "@Interface/Record.js";

export interface Corpus {
	/** The absolute `SKILL.md` path the catalog resolves for this name, or null. */
	resolve(name: string): string | null;
	/** The current body, or null when the catalog does not resolve the name. */
	body(name: string): string | null;
	/** The body the confirm prompt carried, or null when it carried none. */
	carried(name: string): string | null;
	/** The support file's current text, or null when it is absent or unreadable. */
	support(name: string, filePath: string): string | null;
	/** The usage record, or null when the store holds none. */
	record(name: string): UsageRecord | null;
	/** Canonical containment, for the root fence and the archive refusal. */
	contains(parent: string, child: string): boolean;
}
