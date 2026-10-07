export default interface Policy {
    /** Crates cargo upgrade must never bump (one --exclude flag per crate). */
    reject?: string[];
    /** Crates that gate every other update (one -p flag per crate; empty = all). */
    allow?: string[];
    /** Upgrade to latest INCOMPATIBLE versions: "allow" | "ignore". */
    incompatible?: "allow" | "ignore";
    /** Upgrade PINNED requirements to latest incompatible: "allow" | "ignore". */
    pinned?: "allow" | "ignore";
    /** Upgrade to latest COMPATIBLE versions: "allow" | "ignore". */
    compatible?: "allow" | "ignore";
    /** Chain-pass canonical form: "caret" (bare resolved string — Cargo's
     *  implicit caret, the default) or "exact" (`=resolved`). No CLI mapping. */
    pinStyle?: "caret" | "exact";
    /** Dependency groups — accepted for policy-file compatibility with the
     *  package.json governor; cargo upgrade rewrites every dep table. Ignored. */
    depGroups?: string[];
    /** Target selection — no cargo-edit equivalent; accepted and ignored. */
    targets?: {
        default?: string;
        overrides?: Array<{
            filter: string;
            target: string;
        }>;
    };
    /** Concurrent registry lookups — no cargo-edit equivalent; ignored. */
    concurrency?: number;
    /** Shell command run after the upgrade; a non-zero exit fails the stage. */
    verifyCommand?: string | null;
}
