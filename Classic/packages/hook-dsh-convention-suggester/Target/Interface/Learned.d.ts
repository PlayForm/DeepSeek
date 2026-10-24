export default interface Learned {
    /** The repo slug (the root's basename, lowercased) - the proposal's name. */
    slug: string;
    /** The absolute proposal path under `<home>/.dsh/playform/proposals/`. */
    path: string;
    /** The number of families the derivation found. */
    families: number;
}
