// Subcommand - the git subcommand extractor (Function/Subcommand): given one
// command segment, return the git subcommand it invokes, or undefined when
// the segment is not a git command.
//
//   "git status"        -> "status"
//   "git  log --oneline" -> "log"
//   "git"               -> ""   (bare git - e.g. `git --version` parses as
//                                 bare, since a leading flag is not a
//                                 subcommand)
//   "git status && git add -A" -> "status" (one segment at a time; the
//                                 caller splits compounds first)
//   "ls -la"            -> undefined (not a git command)
//
// Leading flags (`git --no-pager log`) are skipped: the first non-flag
// token is the subcommand. A leading env prefix (`GIT_EDITOR=... git ...`)
// is handled by skipping `KEY=VALUE` tokens. Pure internal calculation.
export default (Segment: string): string | undefined => {
	const Tokens = Segment.trim().split(/\s+/);
	let Index = 0;
	// Skip leading `KEY=VALUE` env assignments.
	while (Index < Tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(Tokens[Index] ?? "")) {
		Index += 1;
	}
	switch (true) {
		case Tokens[Index] !== "git":
			return undefined;
	}
	Index += 1;
	// Skip flags between `git` and the subcommand.
	while (Index < Tokens.length && (Tokens[Index] ?? "").startsWith("-")) {
		Index += 1;
	}
	return Index < Tokens.length ? (Tokens[Index] as string).toLowerCase() : "";
};
