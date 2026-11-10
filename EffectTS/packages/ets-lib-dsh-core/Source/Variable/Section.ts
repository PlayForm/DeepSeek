/**
 * @module Section
 *
 * The NPM dependency-section list (the canonical four), the default
 * `Section` state-field value for the JSON governance modules.
 *
 * @remarks
 *
 * It serves the package.json governor + the package.json pinner - the
 * family's single source; the Cargo module's tables differ and stay
 * module-side.
 */

/**
 * The canonical NPM dependency-section list.
 */
export default ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
