import type { CoachRow, Detection } from "../Interface/Execution.js";
export default _default;
/**
 * Detect one judged terminal call. `Command` is the raw command string; `Rows`
 * and `Exempts` are the EFFECTIVE rows/exemptions (built-in defaults with the
 * user's rows appended).
 */
declare function _default(Command: string, Rows: CoachRow[], Exempts: string[]): Detection;
