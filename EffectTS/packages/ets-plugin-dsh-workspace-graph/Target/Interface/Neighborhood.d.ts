export default interface Neighborhood {
    /** The resolved display path of the entry (the anchor's own path included). */
    path: string;
    /** The role in the component: definition | importer | test | dependency | doc. */
    role: string;
    /** The one phrase the model reads (e.g. "the importers"). */
    reason: string;
}
