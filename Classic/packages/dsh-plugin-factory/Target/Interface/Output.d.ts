import type { FsVersion } from "@deepseek-ai/dsh-fs";
export default interface Output {
    /** The next content — an object (JSON module) or a string (text surgery). */
    next: unknown;
    /** The number of changed items; 0 means the designed no-op. */
    count: number;
    /** The module's ledger line for the successful rewrite, verbatim or
     *  composed from the service-issued fresh version. */
    message?: string | ((outcome: {
        version: FsVersion;
    }) => string) | undefined;
}
