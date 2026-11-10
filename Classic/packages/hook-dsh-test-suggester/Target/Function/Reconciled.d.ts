export default _default;
/**
 * @module Reconciled
 *
 * The reconciliation NOTE text: the labeled drift account for the
 * additionalContexts notice.
 *
 * @remarks
 *
 * The delivery surface is the same `additionalContexts` notice the candidate
 * families use; the message itself is built by `Function/Note`, so the source
 * label and the freeze contract are shared.
 *
 * THE SHAPE (byte-exact, asserted by Source/Test/Reconciliation):
 *
 * ```
 * [test-suggester] reconciliation package=<pkg> drifts=<n> expected=<e> actual=<a>
 * - <file> - <reason> (expected <e>, actual <a>)
 * ...
 * note: <the caveat line>
 * ```
 *
 * The header carries the PACKAGE totals (the summed README counts vs the
 * summed counts the runner will actually run); every drift line carries its
 * own pair. The text is bound to maxNoteChars exactly like the intent note
 * (the same truncation with the ellipsis), so one knob governs both.
 */
declare function _default(
/**
 * The reconciliation result (`Function/Reconcile`).
 */
Result: {
    package: string;
    drifts: {
        file: string;
        reason: string;
        expected: number;
        actual: number;
    }[];
    expected: number;
    actual: number;
}, 
/**
 * The hard character cap (config `maxNoteChars`, volatile).
 */
MaxChars: number): string;
