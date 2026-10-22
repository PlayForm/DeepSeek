export default interface Capability {
    /** The stable id: `cap:<sequence>`. */
    id: string;
    /** The holder (the actor the capability belongs to). */
    holder: string;
    /** The resource the capability covers (a path or a resource id). */
    resource: string;
    /** The permitted operations (["*"] = any). */
    operations: string[];
    /** Creation wall-clock ms (leases and expirations need wall time). */
    createdAt: number;
    /** Expiration wall-clock ms; undefined = no expiry. */
    expiresAt?: number | undefined;
    /** The delegation rule: "none" (the holder may not delegate) or
     *  "delegate" (the holder may grant sub-capabilities on the resource). */
    delegation: "none" | "delegate";
    /** Revocation: true once revoked (revocation is permanent, the timing
     *  is the policy's `revocationGraceMs` for lease cleanup). */
    revoked: boolean;
    revokedAt?: number | undefined;
}
