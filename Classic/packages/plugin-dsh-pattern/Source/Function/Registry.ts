// Registry - the in-memory store (Function/Registry): id -> pattern, with
// idempotent Put (a re-Put of the same id replaces in place and keeps no
// duplicate, the HMR-idempotence rule), Get, and List (sorted by id for a
// deterministic output). The Map lives on the service instance; the
// snapshot persistence is Function/Snapshot's business.
import type Pattern from "@Interface/Pattern.js";

export default class Registry {
	private Patterns = new Map<string, Pattern>();

	/** Idempotent by id: replace in place, keep position irrelevant. */
	Put(Pattern_: Pattern): void {
		this.Patterns.set(Pattern_.id, Pattern_);
	}

	Get(Id: string): Pattern | undefined {
		return this.Patterns.get(Id);
	}

	/** All patterns, sorted by id (deterministic output). */
	List(): Pattern[] {
		return [...this.Patterns.values()].sort((Left, Right) => Left.id.localeCompare(Right.id));
	}

	Size(): number {
		return this.Patterns.size;
	}

	/** Replace the whole table (the snapshot load path). */
	Reset(Patterns: Pattern[]): void {
		this.Patterns = new Map(Patterns.map((Pattern_) => [Pattern_.id, Pattern_]));
	}
}
