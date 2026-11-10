/**
 * @module KeyOf
 *
 * The plan key for one (section, crate) pair.
 *
 * @remarks
 *
 * "::" cannot occur in a crate name (only - and _) nor in a section path
 * (dots and cfg(...) parens).
 */
export default (Section: string, Name: string): string => `${Section}::${Name}`;
