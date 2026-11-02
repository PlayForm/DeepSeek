export interface SkillRow {
    /** The frontmatter name, which is the catalog's identity for the skill. */
    readonly name: string;
    /** The one-line description; absent or blank when the row carries none. */
    readonly description?: string;
    /** False when the file disables model invocation; absent when the provider does not report it. */
    readonly modelInvocable?: boolean;
    /** False when the file disables user invocation; carried for symmetry, never filtered on here. */
    readonly userInvocable?: boolean;
}
export interface LoadedSkill {
    /** The frontmatter name. */
    readonly name: string;
    /** The frontmatter description, which the corpus contract requires to be non-empty. */
    readonly description: string;
    /** The exact file text, frontmatter included; a patch anchor is copied from it. */
    readonly content: string;
    /** The package directory a support file is resolved against. */
    readonly resourceBase: {
        readonly path: string;
    };
    /** The absolute file path the catalog resolved, when the provider reports one. */
    readonly path?: string;
}
