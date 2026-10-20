# Absolute Paths Only: Where raw-write Resolves Relative Paths

> Source: SKILL.md Section 1, rule 4, expanded to full philosophy.

## The Rule

The raw-write tool resolves RELATIVE paths against the DeepSeek Harness
PROFILE ROOT, not against the agent's current working directory. When writing
files that live outside the profile root - for example, the family repository,
a workspace folder, a site source tree - pass ABSOLUTE PATHS.

## Why (the full rationale)

- Most file tools in this environment resolve relative paths against the
  session's working directory. raw-write is the exception: its base is the
  profile root, because its primary duty is writing profile-owned files
  (skills, settings, governance targets) that live under the profile.
- An agent who forgets this writes the fixture to the wrong place: the call
  succeeds (the tool created the file somewhere), the agent believes the
  fixture is in the repo, and the smoke suite that reads the repo path finds
  nothing. This is a silent-misplacement failure, the hardest kind to notice
  because every individual step reports success.
- The rule therefore trades one extra keystroke (the absolute path) for the
  elimination of an entire class of "wrote it, but where?" failures.

## Good vs bad

- GOOD: "/Users/name/Developer/family/fixtures-md/dash-demo.md" as the path
  argument, regardless of what the session's current directory happens to be.
- BAD: "fixtures-md/dash-demo.md" intended for the repo while the profile root
  is elsewhere - the file lands under the profile root, not the repo.
- GOOD (edge case): a relative path IS correct when the target genuinely lives
  under the profile root and the agent has reasoned that through; but the
  standing habit for repo and workspace targets is absolute, and that habit
  should not be relaxed for convenience.

## Exceptions

- Profile-rooted targets may be written with relative paths, since relative
  resolution then does the right thing. Everything else is absolute. When in
  doubt, absolute is never wrong.

## Failure modes

- The fixture lands under the profile root; a later session cannot find it and
  may conclude the fixture was never written, then duplicate it.
- Two copies of the "same" fixture exist (one in the repo, one under the
  profile root) with different bytes, and the smoke suite reads the wrong one.
- The agent "fixes" a missing fixture by rewriting it with the plain write into
  the right location, destroying the characters that motivated the rewrite.

## Arbiters

- The post-write existence check at the INTENDED absolute path is the
  immediate arbiter: after every raw-write to a repo/workspace target, confirm
  the file is present at that exact path.
- The smoke suites that read fixtures by their repo paths are the standing
  arbiter that placement was correct.
