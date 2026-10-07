export default interface Manifest {
    /** The identified dependency tables. */
    sections: Array<{
        /** Normalized dotted section path as it appears in the raw text, with
         *  quoted segments unquoted: "dependencies", "dev-dependencies",
         *  "build-dependencies", "workspace.dependencies",
         *  "target.cfg(windows).dependencies". */
        path: string;
        /** Dep name → the parsed entry value: a string (the version requirement)
         *  or a table ({ version: "…", features: [...] } | { workspace: true } |
         *  { path: "…" } | { git: "…", rev: "…" } | …). */
        deps: Record<string, unknown>;
    }>;
}
