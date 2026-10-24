// Options - the resolution seam: the home directory the user layer hangs
// off. Production passes nothing (HOME, then os.homedir()); a smoke passes a
// temporary home so it never reads or writes the real ~/.dsh.
export default interface Options {
	/** The home directory override (the user layer's parent). */
	home?: string;
}
