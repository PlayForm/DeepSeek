import type { ContentBlock } from "@deepseek-ai/dsh-llm";
export default _default;
/**
 * @module Preview
 *
 * The per-type one-line preview builders (plan §4.2, seeded from Aphrodite's
 * preview formats: `[build:1E 1W 142L | ...]` becomes
 * `[terminal:exit 0 | 142 lines | first error line]`).
 *
 * @remarks
 *
 * The composed line is what the replacement content shows above the marker:
 *
 * `[terminal:exit 0 | 142 lines | make: *** error]`
 *
 * `<<<CCR:0a1b2c...|terminal|5231>>>`
 *
 * Pure functions of (type, content, max): no I/O, no clock, no session
 * state. Every builder goes through the SAME hard-cut truncation: a preview
 * longer than `max` (the volatile `previewMaximumChars`, default 240) is cut
 * to exactly `max` characters - the cap is a hard ceiling, never a graceful
 * ellipsis, so a smoke can assert the cut bytes. `error` previews are just
 * the first significant line (the failure message is the preview).
 */
declare function _default(Type: string, Content: ContentBlock[], Maximum: number): string;
