export default interface Invocation {
    /** Ledger label for the run ("base"). */
    label: string;
    /** Crates to upgrade exclusively (one -p flag per crate), or null for the
     *  unfiltered run over every non-excluded dependency. */
    allow: string[] | null;
    /** Crates to exclude (one --exclude flag per crate — the comma form is
     *  silently ignored by cargo upgrade): policy.reject ∪ chain deps. */
    exclude: string[];
}
