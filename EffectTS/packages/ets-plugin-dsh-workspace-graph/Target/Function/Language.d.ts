export default _default;
/**
 * @module Language
 *
 * The extension-based detection of the three parsed languages: TypeScript,
 * JavaScript and Markdown.
 *
 * @remarks
 *
 * Anything else returns undefined and the index call skips the file with the
 * byte-exact `unsupported language` line - no fake parsing of other formats
 * in W1.
 */
declare function _default(Path: string): "typescript" | "javascript" | "markdown" | undefined;
