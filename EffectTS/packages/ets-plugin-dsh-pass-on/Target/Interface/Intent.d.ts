export default interface Intent {
    /** The intent kind (a key of the configured kind table). */
    kind: string;
    /** Explicit target paths/globs; empty = the kind's default globs. */
    targets?: string[];
    /** The kind's arguments (e.g. { version: "1.2.0" }). */
    params?: Record<string, string | number | boolean>;
}
