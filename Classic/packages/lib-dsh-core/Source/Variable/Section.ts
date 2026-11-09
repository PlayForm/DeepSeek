/**
 * @module Section
 *
 * The NPM dependency-section list (the canonical four), the default `Section` state-field
 * value for the JSON governance modules (the package.json governor + the package.json
 * pinner).
 *
 * @remarks
 * The family's single source; the Cargo module's tables differ and stay module-side.
 */
export default ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
