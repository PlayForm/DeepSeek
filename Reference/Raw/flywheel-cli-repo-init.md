# repo:init
Initialize or adopt the selected local repository at a directory; this command does not choose a hosted default workspace or fork.
Reference for `flywheel repo:init`.
Initialize or adopt only the selected local `.flywheel` repository without changing surrounding project files. This command does not choose a hosted default workspace or fork. If the directory's parent is a symbolic link, such as `/tmp` on macOS, the command refuses with `repository_target_parent_symlink` and creates nothing; run it again with the real path it suggests, such as `/private/tmp/example`.
## [Command Group](https://docs.flywheel.paradigma.inc/cli/repo-init#command-group)
Local Repository
## [Summary](https://docs.flywheel.paradigma.inc/cli/repo-init#summary)
Initialize or adopt the selected local repository at a directory; this command does not choose a hosted default workspace or fork.
## [Effect](https://docs.flywheel.paradigma.inc/cli/repo-init#effect)
changes data

```
flywheel repo:init [FLAGS] [directory]
```

## [Arguments](https://docs.flywheel.paradigma.inc/cli/repo-init#arguments)  
| Argument  | Required  | Choices  | Description  |  
| --- | --- | --- | --- |  
| `[directory]`  | No  | Target repository directory.  |  
## [Required flags](https://docs.flywheel.paradigma.inc/cli/repo-init#required-flags)
None.
## [Optional flags](https://docs.flywheel.paradigma.inc/cli/repo-init#optional-flags)  
| Flag  | Value  | Default  | Choices  | Description  |  
| --- | --- | --- | --- | --- |  
| `--personal`  | Use the configured personal repository.  |  
| `--format`  | `FORMAT`  |  `json`, `tsv`, `csv`, `table`  | Output format for command results.  |  
| `--env`  | `PROFILE`  | Select a CLI profile; unconfigured default requires FLYWHEEL_BASE_URL.  |  
| `--out`  | `PATH`  | Write output to a file path, or use - for stdout.  |  
| `--open`  | Open browser-bound URLs when supported.  |  
| `--no-retry`  | Disable transient-error retries.  |  
| `--retry-max`  | Maximum transient-error retry attempts.  |  
| `--wait`  | Block on async operations until a terminal state is reached.  |  
| `--wait-timeout`  | `SECONDS`  | `600`  | Seconds to wait for --wait before timing out. Defaults to 600.  |  
| `--allow-self`  | Allow mutating the currently active credential.  |  
| `--timeout`  | `SECONDS`  | Set the per-request timeout budget in seconds.  |  
| `--idempotency-key`  | `KEY`  | Reuse an Idempotency-Key so ambiguous write failures can be retried with the same key.  |  
| `--force`  | Force safety-gated operations where supported.  |  
| `--yes`  | Confirm forced compute:release-all --force. Other runtime commands do not read --yes.  |  
| `--debug`  | Print structured request debugging with secrets masked.  |  
| `--verbose`  | Print verbose progress for long-running operations.  |  
| `-h, --help`  | Show this help.  |  
## [Examples](https://docs.flywheel.paradigma.inc/cli/repo-init#examples)
Initialize the current existing project directory; Flywheel stores graph history only in .flywheel.

```
flywheel repo:init
```

Create a missing project directory or initialize an existing supported directory.

```
flywheel repo:init <directory>
```

Request stable JSON output for automation.

```
flywheel repo:init --format=json
```

Initialize or adopt the default personal repository and save its path in the user TOML config.

```
flywheel repo:init --personal
```

[repo:gc Delete local artifact objects that no commit, staging entry, or backup still references.](https://docs.flywheel.paradigma.inc/cli/repo-gc)[repo:lineage:add Stage a parent-child lineage relation.](https://docs.flywheel.paradigma.inc/cli/repo-lineage-add)
### On this page
[Command Group](https://docs.flywheel.paradigma.inc/cli/repo-init#command-group)[Summary](https://docs.flywheel.paradigma.inc/cli/repo-init#summary)[Effect](https://docs.flywheel.paradigma.inc/cli/repo-init#effect)[Usage](https://docs.flywheel.paradigma.inc/cli/repo-init#usage)[Arguments](https://docs.flywheel.paradigma.inc/cli/repo-init#arguments)[Required flags](https://docs.flywheel.paradigma.inc/cli/repo-init#required-flags)[Optional flags](https://docs.flywheel.paradigma.inc/cli/repo-init#optional-flags)[Examples](https://docs.flywheel.paradigma.inc/cli/repo-init#examples)
