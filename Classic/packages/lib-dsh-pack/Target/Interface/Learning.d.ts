export default interface Learning {
    /** Whether the bootstrap may propose a pack (never writes silently). */
    propose?: boolean;
    /** Whether accepted suggestions refine the pack. */
    refine?: boolean;
    /** The observation window, in judged calls. */
    window?: number;
}
