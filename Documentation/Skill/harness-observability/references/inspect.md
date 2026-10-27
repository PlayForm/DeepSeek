# Inspect: The Providers and the Workflow

## The workflow

1. **The list.**

    `cordis_inspect_list` shows the providers the host and the client currently offer, with their
    methods and schemas.

2. **The pick.**

    The platform, provider, and method are picked from that list.

3. **The query.**

    `cordis_inspect_query` is called with an input that satisfies the method's schema.

4. **The result.**

    The result is used.

    If a client query times out, reconnect the page and retry; a client failure is not a host
    failure.

## The providers

| Platform | Provider | Typical questions                                 |
| -------- | -------- | ------------------------------------------------- |
| host     | Service  | What methods does `ctx.fs` expose?                |
| host     | Event    | Which mode is `fs/observed`? What is its payload? |
| host     | Config   | What fields does this plugin's schema accept?     |
| host     | Tool     | What parameters does a tool take?                 |
| client   | Service  | Which client services are mounted?                |
| client   | Event    | Which client events exist?                        |
| client   | Builtin  | Which built-in components are available?          |
| client   | Slots    | What is the current slot tree and its props?      |
| client   | Theme    | Which theme tokens are defined?                   |

## What Inspect is not

Inspect is read-only.

It cannot invoke a business service, mutate a config, or change a slot.

It reports what the runtime has.

## When to inspect

- Before writing plugin code that calls a service: get the exact method and its arguments.
- Before hooking an event: get the exact mode and payload shape.
- Before authoring a client plugin: get the slot tree and the theme tokens.
- Before claiming a tool's schema: read it, do not remember it.

## The rule

A runtime fact comes from Inspect, not from memory and not from a document.

Documents describe; the runtime is.

## Failure modes

- **Guessing a method name**: the plugin compiles and fails at call time.
- **Assuming an event mode**: an async listener on an unawaited event.
- **Skipping the list**: querying a provider or method that is not mounted.
- **Treating Inspect as a service**: it cannot perform the business call.
