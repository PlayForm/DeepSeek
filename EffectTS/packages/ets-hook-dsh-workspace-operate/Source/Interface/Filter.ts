// Filter - the list filter for the proposal table (Interface/Filter): every
// field optional; the limit defaults to config limitDefault and is capped
// at config limitMaximum (the graph's own rule, kept identical).
export default interface Filter {
	kind?: "rename" | "connect" | "replace";
	path?: string;
	status?: "proposed" | "withdrawn";
	limit?: number;
}
