export default interface Options {
    /** The home directory override (the user layer's parent). */
    home?: string;
    /** A layer-less workspace falls back to the built-in pack unless this is false. */
    builtin?: boolean;
}
