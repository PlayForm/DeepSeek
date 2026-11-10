export default _default;
/**
 * @module Repository
 *
 * Lists the REPO layer's candidate paths.
 *
 * @remarks
 *
 * The order is `<root>/.dsh/pack.yml`, then `.yaml`, then `.json`. The repo
 * layer overrides the user layer.
 */
declare function _default(Root: string): string[];
