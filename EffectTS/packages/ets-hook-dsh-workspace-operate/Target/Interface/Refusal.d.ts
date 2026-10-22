export default interface Refusal {
    /** The kind the input claimed (never guessed into another kind). */
    kind: "rename" | "connect" | "replace" | "unknown";
    /** The frozen reason (see the header). */
    reason: string;
    /** The human detail (rendered verbatim by the tool). */
    detail: string;
}
