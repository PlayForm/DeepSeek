# Site crawl and the delegation contract

This file covers how a whole-site or sub-seed crawl runs as plain commands against the local
Crawl4AI server, and what a delegated subagent sends back to its parent.

Path: `<crawl4ai>/scripts/crawl_site.py`

Interpreter: `/usr/bin/python3` (3.9.6), standard library only, executable.

The script imports `read_url.py` from the same directory for the URL policy, the token, the server
check, and the `/crawl` call, so each rule has one implementation.

## Purpose

The purpose is to turn a seed URL into a bounded set of Markdown files on disk plus a manifest, and
to return a report small enough to travel in a message.

A crawl is bulk work: without this shape, the pages land in the context window and the parent loses
the thread.

## The delegation contract

A parent that delegates a crawl gets exactly three things back:

1. **The report.**

    The report gives the pages written, the pages failed, the pages skipped, the depth reached, the
    elapsed time, and the absolute paths of the output directory and the manifest.

2. **The manifest.**

    The manifest (`index.json`) holds one entry per page with `url`, `file`, `title`, `depth`,
    `chars`, and `status`, plus a `pending` list of URLs that were discovered but not fetched.

    That list is what `--resume` continues from.

3. **The page files.**

    The page files are Markdown, one per page, each with a frontmatter block that carries `url`,
    `title`, `depth`, `chars`, and `untrusted: true`.

The parent never receives page bodies in the report.

It reads a specific page with the `read` tool when it needs the text, using the `file` path from the
manifest.

That shape keeps a 40-page crawl to a few hundred bytes of message.

The child has these obligations:

1. **The single command.**

    Run one command, bounded by `--depth` and `--max-pages`.

2. **The verbatim numbers.**

    Report the printed numbers verbatim, and do not summarize them into "done".

3. **The failures.**

    Report every failure in the report, with its URL.

4. **The artifacts.**

    Leave the artifacts on disk at an absolute path, and say where.

The parent has these obligations:

1. **The bounds.**

    Pass a seed, a depth, a page cap, and an output directory.

2. **The manifest first.**

    Read the manifest before you ask for any page.

3. **The needed pages.**

    Read only the pages that the task needs.

The mechanics of delegating and of reporting live in the `worker-strains` and `orchestrator-batch`
skills, and this file states only the artifact contract.

## Usage

```text
crawl_site.py SEED [options]
```

## Options

| Flag                   | Default                    | Meaning                                                          |
| ---------------------- | -------------------------- | ---------------------------------------------------------------- |
| `--depth`              | `1`                        | Hops to follow; `0` is the seed alone; max 10                    |
| `--max-pages`          | `25`                       | Hard cap on pages written                                        |
| `--batch-size`         | `10`                       | URLs per `/crawl` request, `1..100`                              |
| `--out`                | `crawl-<host>-<timestamp>` | Output directory (relative to the cwd)                           |
| `--include`            | none                       | Follow only URLs matching this regex                             |
| `--exclude`            | none                       | Never follow URLs matching this regex                            |
| `--include-subdomains` | off                        | Follow into subdomains of the seed host                          |
| `--ignore-robots`      | off                        | Do not consult robots.txt                                        |
| `--max-chars`          | `50000`                    | Truncate each page file; `0` disables                            |
| `--timeout`            | `90`                       | Per-request timeout in seconds                                   |
| `--delay-ms`           | `0`                        | Sleep between batches, milliseconds                              |
| `--cache`              | `enabled`                  | Crawl4AI cache mode for the bulk crawl                           |
| `--prune-threshold`    | `0.48`                     | `PruningContentFilter` threshold                                 |
| `--wait-for`           | none                       | CSS selector to wait for on every page                           |
| `--raw`                | off                        | Keep full DOM Markdown instead of readability                    |
| `--resume`             | off                        | Continue from the saved frontier, skipping pages already on disk |
| `--dry-run`            | off                        | Print the frontier and write nothing                             |
| `--json`               | off                        | Print the report as JSON                                         |
| `--allow-private`      | off                        | Lift the wrapper's private-address guard                         |

## Output layout

```text
<out>/
  index.json          the manifest
  summary.md          the same report as Markdown tables
  pages/
    001-index.md
    002-page2.md
    ...
```

Each page file:

```markdown
---
url: https://example.com/docs/start
title: Getting started
depth: 1
chars: 4211
untrusted: true
---

<Markdown body>
```

## The report

Text mode has the form that a subagent relays:

```text
crawl:    quotes.toscrape.com
seed:     https://quotes.toscrape.com/
depth:    1 reached of 1 requested
pages:    5 written   failed: 0   skipped: 0
elapsed:  4.1s
output:   /tmp/c4site
manifest: /tmp/c4site/index.json
```

`--json` emits the same facts as an object: `seed`, `host`, `pages`, `failed`, `skipped`,
`documents_skipped`, `depth_reached`, `depth_requested`, `out_dir`, `manifest`, `summary`,
`page_urls`, `failures`, `pending`, and `elapsed_s`.

A `pending` count above zero means that the page cap or the depth limit stopped the crawl with work
left.

Re-running the same command with `--resume` continues from that frontier without refetching a single
page.

## Bounds and politeness

| Bound                | Default       | Why                                               |
| -------------------- | ------------- | ------------------------------------------------- |
| Depth                | 1             | Link graphs explode past two hops                 |
| Pages                | 25            | The real brake on wall time and rate limits       |
| Same host            | on            | "This site", not the internet                     |
| robots.txt           | consulted     | Skip disallowed paths; `--ignore-robots` opts out |
| Assets and documents | never fetched | Images, CSS, JS, PDF and Office files are skipped |
| Cache                | enabled       | A bulk crawl should not refetch what it has       |

Robots handling is a deliberate subset: `User-agent` groups, `Disallow`, `Allow`, `*` wildcards, `$`
anchors, and longest-match precedence.

It does not implement crawl-delay, sitemaps, or request-rate directives.

If the seed itself is disallowed, the crawl stops with exit 3 and says so.

Documents found while crawling are recorded as `document` skips, not fetched.

Read one when it matters with `read_url.py "<document url>"`, which routes it to anydoc.

## Exit codes

| Code | Meaning                                                    |
| ---- | ---------------------------------------------------------- |
| 0    | Completed; at least one page written                       |
| 2    | Usage error (bad `--depth`, `--max-pages`, `--batch-size`) |
| 3    | Seed refused by policy, or disallowed by robots.txt        |
| 5    | Seed could not be fetched, or no page written              |
| 7    | Crawl4AI server unavailable or token rejected              |

Per-page failures do not change the exit code, and they are listed in the report and in
`index.json`.

## Examples

```bash
S= < crawl4ai > /scripts

# what would this crawl reach?
"$S/crawl_site.py" https://docs.example.com/ --dry-run

# a documentation section, two hops, forty pages
"$S/crawl_site.py" https://docs.example.com/ --depth 2 --max-pages 40 \
	--include "/docs/" --out /tmp/docs

# the sub-seed: one page and everything it links to
"$S/crawl_site.py" https://example.com/blog/ --depth 1 --max-pages 15

# extend a finished crawl without refetching
"$S/crawl_site.py" https://docs.example.com/ --depth 3 --max-pages 80 \
	--include "/docs/" --out /tmp/docs --resume

# a polite crawl of a small site
"$S/crawl_site.py" https://small.example/ --depth 2 --max-pages 30 \
	--delay-ms 250 --json
```

## Verification

```bash
"$S/crawl_site.py" https://quotes.toscrape.com/ --depth 1 --max-pages 5 --out /tmp/c4check
echo $?
```

Expect exit 0 and `pages: 5 written   failed: 0`.

Then confirm the artifacts:

```bash
ls /tmp/c4check /tmp/c4check/pages
head -c 200 /tmp/c4check/index.json
```

A missing `index.json` means that the crawl aborted before the manifest step, so report the exit
code and do not read a partial directory as a finished crawl.
