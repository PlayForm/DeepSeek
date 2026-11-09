/**
 * @module Filter
 *
 * The list filter for the proposal table: every field optional.
 *
 * @remarks
 * The limit defaults to config limitDefault and is capped at config
 * limitMaximum (the graph's own rule, kept identical).
 */
export default interface Filter {
    /**
     * The proposal kind to keep.
     */
    kind?: "rename" | "connect" | "replace";
    /**
     * The proposal path to keep.
     */
    path?: string;
    /**
     * The proposal status to keep.
     */
    status?: "proposed" | "withdrawn";
    /**
     * The cap on the returned rows.
     */
    limit?: number;
}
