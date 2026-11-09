/**
 * @module Operation
 *
 * One write the review may perform, discriminated on `kind`.
 *
 * @remarks
 * The set is closed at three kinds, and there is no delete member and no archive member,
 * which is how the Hermes rule "never delete a skill here" becomes structural rather
 * than advisory: a reply cannot express a removal, so no judge rule has to remember to
 * refuse one. `reason` is required on every kind because the ledger row carries it as
 * evidence for a revert a person may have to judge months later.
 *
 * Every field is readonly: an operation is parsed once and then judged, carried, and
 * written, and a mutation between those steps would let the fence and the judge disagree
 * about what they approved.
 */
/** A literal edit of one existing skill's body. */
export interface PatchOperation {
    /** The discriminator. */
    readonly kind: "patch";
    /** The existing skill whose body the anchor was copied from. */
    readonly skill: string;
    /** Exact text from the carried body; the judge requires exactly one occurrence. */
    readonly oldString: string;
    /** The replacement text. */
    readonly newString: string;
    /** One sentence naming the lesson, never the incident. */
    readonly reason: string;
}
/** A whole new `SKILL.md` for a name the catalog does not yet hold. */
export interface CreateOperation {
    /** The discriminator. */
    readonly kind: "create";
    /** The new skill's name; the judge refuses a name the catalog already resolves. */
    readonly skill: string;
    /** The whole `SKILL.md`, frontmatter included. */
    readonly content: string;
    /** One sentence naming the lesson, never the incident. */
    readonly reason: string;
}
/** A whole-file write of one support file under an existing skill. */
export interface SupportOperation {
    /** The discriminator. */
    readonly kind: "support";
    /** The existing skill the file belongs to. */
    readonly skill: string;
    /** The path under the skill: `references/`, `templates/` or `scripts/`. */
    readonly filePath: string;
    /** The whole file. */
    readonly newString: string;
    /** One sentence naming the lesson, never the incident. */
    readonly reason: string;
}
/** The closed three-kind union; there is no delete and no archive member. */
export type Operation = PatchOperation | CreateOperation | SupportOperation;
