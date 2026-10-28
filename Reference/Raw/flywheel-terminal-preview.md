# Terminal preview

View your local Flywheel repositories in a browser, without an account or uploading your work.

`flywheel ui` opens a read-only view of your local research graph in your normal browser. It shows committed and staged work across the repositories your CLI has opened, and updates when you or your agents change them. You do not need a Flywheel account, a Mac app, or an internet connection to browse local work.

## Install and open

On macOS, Linux, or inside WSL, install the CLI with a supported [Node.js version](./install.md#platform-support):

```
curl -fsSL https://flywheel.paradigma.inc/install | sh -s -- --mode cli
```

CLI-mode setup installs your agents' Flywheel skills without requiring sign-in. Use CLI mode for agents whose work should appear in local repositories. MCP mode writes directly to Flywheel online instead; that work does not appear locally until you clone or pull the repository. See [Install](./install.md) for the other installation methods and setup options. Native Windows does not support local repositories; use WSL there.

In a folder that already contains a Flywheel repository, run:

```
flywheel ui
```

If this is a new project, initialize its repository first:

```
mkdir -p ~/research
flywheel repo:init ~/research
flywheel ui --repo ~/research
```

The command finds the nearest repository above your current folder, or uses the folder you pass with `--repo`. It does not create a repository automatically. To use your configured personal repository instead, run `flywheel ui --personal`. If you have not created one yet, run `flywheel repo:init --personal` first.

The installed package includes the page and its fonts. You do not need a source checkout, a separate web server, or an extra UI download.

## First visit and optional sign-in

The CLI opens a single-use link that authorizes your browser to read the local server. That link is not a Flywheel online account login. If the browser does not open, use the link printed in the terminal; it works once, within five minutes. Run `flywheel ui` again for a new link if needed.

On your first visit, choose **Sign In** or **Continue Without Signing In**. Continuing without keeps local browsing and local CLI/agent work available, and the choice is remembered on this computer. You can sign in later from the Cloud button or Settings → This Mac. Next, **Set up your agents** offers the same agent setup as Settings → This Mac; **Go to Free View** leaves it, and it is not asked again on this computer.

Signing in connects this computer and its CLI to Flywheel online. It does **not** publish a repository, upload your local work, or start synchronization. A saved sign-in may be checked online when the page opens; an unavailable online service does not prevent browsing local repositories. Hosted account-management features, such as billing and MCP keys, remain on **Open Flywheel online**.

## What the page shows

- **Free View and Timeline** show your recorded local repositories together. Each CLI command that opens a repository records it; there is no full-disk scan or separate Add Repo step. Older repositories appear after any command opens them.
- **Repos** lets you narrow the view by folder. Opening `flywheel ui --repo …` brings that folder into the opened page's selection while preserving other included folders and your other filters. Two clones in different folders stay separate, even when they contain the same node IDs.
- **Uncommitted work** appears before an agent commits it. The uncommitted count opens the change list; the View menu can hide or show staged work. Node pages label their staged values as uncommitted.
- **Only on this Mac**, the not-pushed count, and the last-pulled time describe local sync state. They do not automatically ask Flywheel online for new work.
- **Artifacts** open from disk. If an artifact was not downloaded with a clone, its page prints the command to fetch it. Fetching missing hosted files needs sign-in and internet access; already-downloaded files work offline.

The graph browser has no controls to edit, commit, delete, share, or publish nodes. Make graph changes with the CLI or your agents. The page shows the result as it arrives. Account settings and explicit agent setup are separate from graph editing.

An empty repository shows how to start your coding agent in its folder. If you want to share the work later, first review the publication preview:

```
flywheel repo:push --repo ~/research --create-remote --dry-run
```

The preview does not upload anything. Publishing requires a separate explicit push; pulling and cloning are explicit CLI operations too. See [Repositories](./concepts-repos.md) for the complete workflow.

## Ports, stopping, and reconnecting

The server listens only on `127.0.0.1`, normally on port **8484**. If another program holds that port, it uses the next free port and records the actual port and process in `ui-server.json` in your Flywheel configuration folder. Read the address printed by the command rather than assuming it is always 8484.

Keep the terminal running. **Ctrl-C** stops the server. An already-open tab shows **Flywheel isn't running** with its restart command and reconnects automatically when the server returns at the same address. Its local browser session survives server restarts; restarting does not require signing in to Flywheel online.

There is one server per user and computer. A later `flywheel ui`, including one started while the Mac app is running, opens that server and exits rather than starting another. Stopping that later command does not stop the existing server.

| Option | Behavior |
|----|----|
| `--repo <path>` | Open an existing repository instead of finding one above the current folder. |
| `--personal` | Use the configured personal repository; do not combine with `--repo`. |
| `--port <number>` | Use exactly that port, or report an error if it is occupied. If a server already runs on another port, the command reports that instead of starting a second one. |
| `--settings <tab>` | Open a Settings tab; for example, `--settings local` opens This Mac. |

See [`flywheel ui`](./cli-ui.md) or run `flywheel ui --help` for the command reference.

### Over SSH

Run `flywheel ui` on the remote machine in the repository you want to view. In an SSH session it opens no remote browser: it prints the single-use link and the matching port-forwarding command. Run that forwarding command on your own computer, then open the printed link in your local browser. For example, when the server uses port 8484:

```
ssh -L 8484:localhost:8484 user@research-machine
```

Use the actual port and SSH destination printed for your session. Keep both the UI server and forwarding connection running, and do not expose the listener to the network.

## When something goes wrong

- **No repository here:** run the suggested `repo:init` command, select an existing folder with `--repo`, or initialize/use your personal repository.
- **Another agent is writing:** local reads normally keep working. A conflicting write waits up to ten seconds, then reports `repository_locked` with the next action. Let the writer finish and retry; do not delete its lock file.
- **A repository needs a newer Flywheel:** its Repos row says so. If every available repository is too new, the page shows **Update Flywheel** with the CLI's update advice. Update the terminal installation with `flywheel update` (or update the Mac app for its copy); do not alter the repository's format. Older supported formats upgrade automatically after a backup.
- **A recorded folder moved or disappeared:** its Repos row is greyed out and offers **Remove**. Removing the entry forgets the folder; it does not delete files. Open the repository in its new location with the CLI to record it again.
- **The browser's local session expired or was cleared:** run `flywheel ui` again and use its new single-use link. This is separate from signing in to Flywheel online.
- **The page files are missing:** follow the command's installation-repair message. A normal terminal installation already includes these files.

[Install](./install.md)

Install, update, and uninstall the Flywheel CLI.

[Graph Model](./concepts-graph-model.md)

Flywheel represents research work as a directed graph of durable nodes.

<!--
## Source links

- [Node.js version](./install.md#platform-support) - source: /install#platform-support
- [Install](./install.md) - source: /install
- [Repositories](./concepts-repos.md) - source: /concepts/repos
- [flywheel ui](./cli-ui.md) - source: /cli/ui
- [Graph Model Flywheel represents research work as a directed graph of durable nodes.](./concepts-graph-model.md) - source: /concepts/graph-model
-->
