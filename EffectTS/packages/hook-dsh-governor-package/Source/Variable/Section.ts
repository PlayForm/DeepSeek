// Section — the dependency sections the governor may amend, re-exported
// from the CORE's Variable/Section (the family's single source). The
// circuit breaker (Function/Transform's refusal guard) allows ONLY these to
// differ between the author's manifest and the governed one — the governor
// can never restructure a file; a difference in any other section refuses
// the rewrite outright.
import { Section } from "@playform/hook-dsh-core";

export default Section;
