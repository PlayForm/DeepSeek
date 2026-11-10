export default _default;
/**
 * @module User
 *
 * Lists the USER layer's candidate paths for a slug.
 *
 * @remarks
 *
 * The order is the documented `.yml`, then `.yaml`, then `.json` (the JSON
 * form needs no YAML parser).
 */
declare function _default(Slug: string, Home: string): string[];
