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
