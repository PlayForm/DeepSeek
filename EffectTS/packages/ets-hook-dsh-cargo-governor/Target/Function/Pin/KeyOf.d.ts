export default _default;
/**
 * @module KeyOf
 *
 * The plan key for one (section, crate) pair.
 *
 * @remarks
 * "::" cannot occur in a crate name (only - and _) nor in a section path
 * (dots and cfg(...) parens).
 */
declare function _default(Section: string, Name: string): string;
