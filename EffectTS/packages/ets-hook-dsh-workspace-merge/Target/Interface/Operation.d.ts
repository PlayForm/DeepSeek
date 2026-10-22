export default interface Operation {
    /** The file to write (resolved through ctx.fs against the session
     *  working directory). */
    path: string;
    /** The final content of the whole file (the merge writes whole files
     *  through the factory's Write executor; span editing is the replace
     *  proposal's job, applied upstream). */
    content: string;
    /** The expected version (the fence). */
    version: string;
}
