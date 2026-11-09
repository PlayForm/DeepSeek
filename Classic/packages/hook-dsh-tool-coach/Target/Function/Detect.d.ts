/**
 * @module Detect
 *
 * The classifier for one judged terminal call.
 *
 * @remarks
 * Plan Part 3 §3.5 step 1 + the adversarial layer Part 2 §2.7. Detection is
 * NEVER exact-match only: command normalization (Function/Normalize) + the
 * pattern rows + an intent-marker scan + a craft library + a catch-all - the
 * pattern table is one input, not the authority.
 *
 * The evaluation order per pipeline (a maximal run of segments joined by `|`,
 * pipelines split on `;`/`&&`/`||`/`&`):
 *   1. CLASSIFY (rows first, then markers) - exemption is an OVERRIDE of a
 *      would-be offense, so the pipeline is classified first;
 *   2. EXEMPT override: if the pipeline's head matches an exemption and the
 *      pipeline would have been flagged, the pipeline is exempt (rule 5: an
 *      exempt head dominates the rest of the pipeline; a bare non-exempt head
 *      like `echo x > tracked.md` still fires);
 *   3. the highest-priority class across all pipelines wins (write > read >
 *      search > discovery > control) - chained segments classify INDIVIDUALLY
 *      (`cat a; sed -i ...` yields one read match and one write match, and the
 *      write match is reported).
 *
 * Markers (plan §2.7b) - class determined by intent, not vocabulary:
 *   - redirect to a real path (`>` / `>>` not to /dev/null) -> write (the
 *     catch-all: novel zero-day forms still land; the redirect wins over an
 *     earlier read-row match because write outranks every other class, e.g.
 *     `cat f | sed s/a/b/ > f` is write);
 *   - decode-then-execute (`base64 -d | sh`, `printf x | sh`, any pipeline
 *     whose last segment is a shell) -> write (payload execution = unreviewed
 *     content);
 *   - `$var` indirection with `-i` (`«var» -i ...`) -> write (craft library);
 *   - `--in-place` anywhere -> write;
 *   - wrappers (sh -c / bash -c / eval / xargs / find -exec) never exempt:
 *     the INNER payload is re-scanned through the same rows.
 */
import type { CoachRow, Detection } from "@Interface/Execution.js";
export default _default;
/**
 * Detect one judged terminal call. `Command` is the raw command string; `Rows`
 * and `Exempts` are the EFFECTIVE rows/exemptions (built-in defaults with the
 * user's rows appended).
 */
declare function _default(Command: string, Rows: CoachRow[], Exempts: string[]): Detection;
