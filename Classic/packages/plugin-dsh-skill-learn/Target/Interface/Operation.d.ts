export interface PatchOperation {
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
export interface CreateOperation {
    readonly kind: "create";
    /** The new skill's name; the judge refuses a name the catalog already resolves. */
    readonly skill: string;
    /** The whole `SKILL.md`, frontmatter included. */
    readonly content: string;
    /** One sentence naming the lesson, never the incident. */
    readonly reason: string;
}
export interface SupportOperation {
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
export type Operation = PatchOperation | CreateOperation | SupportOperation;
