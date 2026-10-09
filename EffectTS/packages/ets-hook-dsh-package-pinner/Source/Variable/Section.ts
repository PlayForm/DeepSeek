// Section — the DEFAULT dependency sections the pinner may rewrite (the
// schema default of the `sections` config field; a deployment can narrow or
// extend the list without a code edit), re-exported from the CORE's
// Variable/Section (the family's single source). Function/Pin rewrites
// version values ONLY inside these sections and the refusal guard allows
// ONLY these to differ between the author's manifest and the pinned one —
// the pinner can never restructure a file; a difference in any other section
// refuses the rewrite outright.
import { Section } from "@playform/ets-hook-dsh-core";

export default Section;
