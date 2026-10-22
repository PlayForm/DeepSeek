export default interface PolicyRule {
    /** The resource kind the rule applies to ("*" = any kind). */
    kind: string;
    /** The disposition the rule forces. */
    disposition: "keep" | "defer" | "evict" | "discard" | "promote";
    /** Optional TTL override for leases on resources of this kind (ms). */
    ttlMs?: number | undefined;
    /** Optional maximum residency age (ms) after which the disposition
     *  escalates from "defer" to the rule's own disposition. */
    maxResidencyMs?: number | undefined;
    /** Optional revocation grace (ms): how long a revoked capability's
     *  resource keeps the "promote" protection. */
    revocationGraceMs?: number | undefined;
}
