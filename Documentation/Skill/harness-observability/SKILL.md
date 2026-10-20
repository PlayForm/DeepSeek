---
name: harness-observability
description: "What this agent can observe in the running harness: the Inspect providers, the agent-control surface, the background jobs and goals, the ~/.dsh state (sessions with token usage, skills, profiles, governance ledgers), the filesystem and web access, and the honest limits."
whenToUse: When the user asks what you can see or do, when you need runtime facts (services, events, configs, tools, slots, themes), when inspecting ~/.dsh state, or before building tooling on the observable surface.
version: 2.0.0
updated: 2026-10-20
---

# Harness Observability

This skill maps the observable surface of the running harness: what the
agent can inspect, what it can control, where the durable state lives, and
what it cannot see. Inspect before guessing; the runtime is the authority.

## When to use

- The user asks about access, visibility, or capabilities.
- You need an exact Service method, Event mode, Config schema, Tool
  schema, theme token, or Slot tree.
- You need to read a session's token usage, a governance ledger, or a
  profile's bundles.
- Do not use for: what to do with the facts (the owner skill), or the
  model policy (`task-routing`).

## The inspect tools

| Platform | Provider  | Methods                          |
| -------- | --------- | -------------------------------- |
| host     | Service   | list, describe                   |
| host     | Event     | list, describe                   |
| host     | Config    | list, describe                   |
| host     | Tool      | list, describe                   |
| client   | Service   | list, describe                   |
| client   | Event     | list, describe                   |
| client   | Builtin   | list                             |
| client   | Slots     | tree, props                      |
| client   | Theme     | tokens                           |

Call `cordis_inspect_list` first, then `cordis_inspect_query` with the
provider and method from the list. The methods are read-only; they are not
business services and cannot change the runtime.

## The agent-control surface

| Tool            | What it does                                             |
| --------------- | -------------------------------------------------------- |
| `list_agents`   | The subagent tree with statuses                          |
| `send_message`  | Continue a child; activate, amend, or nudge              |
| `interrupt_agent` | Stop a child's work                                    |
| `subagent`      | A self-contained child                                   |
| `subagent_fork` | A child that inherits this conversation                  |
| `workflow`      | Scripted orchestration over many agents                  |

## The runtime state

| Tool                  | What it reads                                      |
| --------------------- | -------------------------------------------------- |
| `job_list`/`job_output`/`job_kill` | Background jobs                      |
| `list_subagent_models` | The LLM route catalog                             |
| `plugin_manager`      | The profile's plugins and bundles                  |
| `get_goal`/`update_goal` | The persisted goal state                       |

## The ~/.dsh state

| Path                    | What it holds                                        |
| ----------------------- | ---------------------------------------------------- |
| `~/.dsh/sessions/`      | Session transcripts (zstd JSONL) with token usage    |
| `~/.dsh/skills/`        | The global skill corpus                              |
| `~/.dsh/profiles/`      | Bundles, `cordis.patch.yml`, settings                |
| `~/.dsh/*.log`          | The governance ledgers                               |

## The honest limits

- The main session's own token usage is not in its own transcript; the
  subagents' usage is.
- There is no implicit DOM, route, or screenshot context for the GUI.
- Other conversations are separate; their files exist but their live
  content is not this session.
- The subagent tool does not consult role routing when the route is
  omitted; it inherits the parent's route. That is why the route is always
  explicit (`task-routing`).
- The future queue is not observable; the user's messages and the process
  records are.

## Verification

- Inspect results name the provider, method, and platform they came from.
- A fact about a service or a tool comes from Inspect, not from memory.
- A state claim cites the path or the tool that produced it.

## Anti-patterns

| Mistake                              | Cost                                    | Do instead                    |
| ------------------------------------ | --------------------------------------- | ----------------------------- |
| Guessing a Service method            | The plugin calls a method that is not there | `cordis_inspect_query`    |
| Reading another conversation's files | Privacy and authority confusion         | Use this session's state      |
| Assuming GUI context                 | Answers about a DOM you cannot see      | Ask or inspect via the client |
| Trusting a route default             | The child inherits the expensive lane   | Pass the triple               |

## References

| File                        | Covers                                            | Read when                    |
| --------------------------- | ------------------------------------------------- | ---------------------------- |
| `references/inspect.md`     | The providers, methods, and inspection workflow    | You need a runtime fact      |
| `references/state.md`       | Sessions, usage, profiles, skills, and ledgers     | You need durable state       |
| `references/limits.md`      | The honest limits, the filesystem, and the web     | A question touches a limit   |
