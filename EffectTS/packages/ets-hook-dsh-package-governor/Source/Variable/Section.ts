import { Section } from "@playform/ets-lib-dsh-core";

/**
 * @module Section
 *
 * The dependency sections the governor may amend, re-exported from the CORE's
 * Variable/Section (the family's single source).
 *
 * @remarks
 *
 * The circuit breaker (Function/Transform's refusal guard) allows ONLY these
 * to differ between the author's manifest and the governed one - the governor
 * can never restructure a file; a difference in any other section refuses the
 * rewrite outright.
 */
export default Section;
