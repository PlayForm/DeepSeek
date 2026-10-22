// Lease - the LEASE record (for how long). One of the three separate
// authority records (v4.1 section 3.9); it carries NO permission set - what
// the holder may do lives in the capability, the lease only holds time.
export default interface Lease {
	/** The stable id: `lease:<sequence>`. */
	id: string;
	/** The holder. */
	holder: string;
	/** The resource held. */
	resource: string;
	/** Acquisition wall-clock ms. */
	acquiredAt: number;
	/** Expiry wall-clock ms (acquiredAt + ttl). */
	expiresAt: number;
	/** True once released or swept (expired). */
	closed: boolean;
}
