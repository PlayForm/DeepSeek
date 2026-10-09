// Unavailable — the graceful no-cargo-edit detector: the binary can't be
// resolved (spawn ENOENT) or cargo answers "no such command: upgrade"
// (exit 101 — cargo installed, cargo-edit absent). Pure.
export default (Text: string): boolean =>
	/no such (command|subcommand)/i.test(Text) || /ENOENT|not found/i.test(Text);
