export default _default;
declare function _default(
/** The reconciliation result (Function/Reconcile). */
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
/** The hard character cap (config `maxNoteChars`, volatile). */
MaxChars: number): string;
