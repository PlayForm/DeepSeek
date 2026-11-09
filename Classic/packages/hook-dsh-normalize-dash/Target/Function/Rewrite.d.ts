/**
 * The selection: `true`/"all" = all six; an array (or a single name) = the
 * named flavors; false/null/undefined/unknown = none (verbatim).
 */
export type Selection = boolean | string | string[] | null | undefined;
export default _default;
declare function _default(Content: string, Replacement: string, Select: Selection): string;
