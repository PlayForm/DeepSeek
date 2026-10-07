// Plan — the chain pass's output (Function/Satisfy) consumed by the surgical
// rewrite (Function/Pin): the exact entry-level changes, as pure data. The
// rewrite never re-derives them from parsed values — it applies only these,
// line-surgically, so nothing outside the planned entries can change.
export default interface Plan {
	/** Version canonicalizations: one per dep entry whose version is out of
	 *  chain. `from` is the current version requirement string (used only as a
	 *  safety check against racing edits); `to` is the canonical form (the
	 *  bare resolved value — Cargo's implicit caret — or `=resolved` when the
	 *  policy says exact pins). */
	replacements: Array<{
		/** Normalized dependency section path (Function/Decode's form). */
		section: string;
		/** The crate name. */
		name: string;
		/** The current version requirement string. */
		from: string;
		/** The canonical version requirement string. */
		to: string;
	}>;
	/** Strict-mode strips: entries to remove entirely (the whole
	 *  `name = "…"` line, or the entry table) — the documented Cargo-specific
	 *  decision for unknown deps in an explicitly strict workspace. */
	strips: Array<{
		section: string;
		name: string;
	}>;
}
