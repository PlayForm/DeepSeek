/**
 * @module Options
 *
 * Describes the resolution seam: the home directory the user layer hangs off,
 * and whether a workspace with no layer at all still falls back to the
 * BUILT-IN pack.
 *
 * @remarks
 * Production passes nothing (HOME, then `os.homedir()`; the built-in fallback
 * on); a smoke passes a temporary home so it never reads or writes the real
 * `~/.dsh`, and `builtin: false` makes a layer-less workspace resolve to
 * `undefined` instead of the built-in pack.
 */
export default interface Options {
    /**
     * The home directory override (the user layer's parent).
     */
    home?: string;
    /**
     * A layer-less workspace falls back to the built-in pack unless this is false.
     */
    builtin?: boolean;
}
