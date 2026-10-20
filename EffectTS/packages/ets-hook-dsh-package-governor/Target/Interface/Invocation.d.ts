export default interface Invocation {
    /** Ledger label for the run ("base" or "filter <pattern>"). */
    label: string;
    /** ncu --target for the run. */
    target: string;
    /** ncu -f filter, or null for the unfiltered base run. */
    filter: string | null;
}
