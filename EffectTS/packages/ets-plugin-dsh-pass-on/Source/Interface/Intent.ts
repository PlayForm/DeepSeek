// Intent - the input to the pass-on: a suggestion from the suggester, or a
// user/agent intent ("bump the version"), or a batch authored by hand
// (Documentation/Plans/PASS-ON-AND-INGER.md section 3). The intent names the
// kind; the params carry the kind's arguments.
export default interface Intent {
	/** The intent kind (a key of the configured kind table). */
	kind: string;
	/** Explicit target paths/globs; empty = the kind's default globs. */
	targets?: string[];
	/** The kind's arguments (e.g. { version: "1.2.0" }). */
	params?: Record<string, string | number | boolean>;
}
