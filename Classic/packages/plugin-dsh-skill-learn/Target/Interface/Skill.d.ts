/**
 * @module Skill
 *
 * The STRUCTURAL catalog shapes: the index row and the loaded skill.
 *
 * @remarks
 *
 * TAKEN FROM `@deepseek-ai/dsh-skill` and its filesystem provider, neither of which this
 * package can import (`@deepseek-ai/dsh-skill` is not installed), so the two shapes are
 * declared here exactly as far as the plugin reads them:
 *
 * - row - `ctx.skills.list({cwd, scope, signal})` returns one row per discovered skill
 *   (`dsh-skill/lib/index.js:224`); the index renders `name` and `description` (plan
 *   section 4.1)
 * - loaded - `ctx.skills.get(name, {...})` returns the parsed skill with its raw text
 *   and its package directory (`dsh-skill/lib/index.js:250`), which is what a patch
 *   anchor is copied from and what `resourceBase` places a support file under (plan
 *   section 6.1)
 *
 * THE INVOCABILITY FLAGS ARE OPTIONAL ON PURPOSE. The plan's open question 1 records
 * that the row's declared type was never read, so the filter may only be applied "when
 * the row carries the flag" and otherwise falls back to the `skill` tool's own gate
 * (plan section 14, question 1). A required flag would make a provider that omits it a
 * type error instead of the documented case, and a missing flag would then be
 * indistinguishable from a false one - which is the one confusion that would hide a
 * skill from the index.
 *
 * `resourceBase.path` IS REQUIRED on the loaded skill because every support write
 * resolves its destination from it (`dsh-skill/lib/index.js:250`, plan section 6.1): a
 * skill without a package directory has no support-file home, and the judge's
 * `support-path` rule needs that home to exist.
 */
/**
 * One index row from the catalog listing.
 */
export interface SkillRow {
    /**
     * The frontmatter name, which is the catalog's identity for the skill.
     */
    readonly name: string;
    /**
     * The one-line description; absent or blank when the row carries none.
     */
    readonly description?: string;
    /**
     * False when the file disables model invocation; absent when the provider does not report it.
     */
    readonly modelInvocable?: boolean;
    /**
     * False when the file disables user invocation; carried for symmetry, never filtered on here.
     */
    readonly userInvocable?: boolean;
}
/**
 * The parsed skill `get` returns.
 */
export interface LoadedSkill {
    /**
     * The frontmatter name.
     */
    readonly name: string;
    /**
     * The frontmatter description, which the corpus contract requires to be non-empty.
     */
    readonly description: string;
    /**
     * The exact file text, frontmatter included; a patch anchor is copied from it.
     */
    readonly content: string;
    /**
     * The package directory a support file is resolved against.
     */
    readonly resourceBase: {
        /**
         * The absolute package directory path.
         */
        readonly path: string;
    };
    /**
     * The absolute file path the catalog resolved, when the provider reports one.
     */
    readonly path?: string;
}
