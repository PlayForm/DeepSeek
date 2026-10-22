export default interface Request {
    /** The path the change set touches. */
    path: string;
    /** The content fingerprint of the change set being executed. */
    fingerprint: string;
    /** The file version observed right now. */
    version: string;
}
