export default _default;
/**
 * @module User
 *
 * The USER layer's candidate paths for a slug: the documented `.yml`, then
 * `.yaml`, then `.json`.
 *
 * @remarks
 * The JSON form needs no YAML parser.
 */
declare function _default(Slug: string, Home: string): string[];
