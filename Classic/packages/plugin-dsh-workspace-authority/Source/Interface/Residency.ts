// Residency - the RESIDENCY record (what stays in the store). One of the
// three separate authority records (v4.1 section 3.9). The WEIGHT is the
// representation's field: it ranks candidates for the eviction pass but
// NEVER decides a disposition - the policy table (the license) decides, the
// weight only ranks (the logged pitfall).
export default interface Residency {
	/** The resource (a path or a resource id; one record per resource). */
	resource: string;
	/** The resource kind (the policy table's lookup key). */
	kind: string;
	/** The weight - representation only, ranks candidates, never decides. */
	weight: number;
	/** Registration / last-touch wall-clock ms. */
	since: number;
	/** True once promoted (protected: never evicted while a lease or an
	 *  active capability covers the resource). */
	promoted: boolean;
	/** The last disposition this record received, or "none". */
	disposition: "keep" | "defer" | "evict" | "discard" | "promote" | "none";
}
