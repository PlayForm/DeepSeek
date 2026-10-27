#!/usr/bin/env python3
"""crawl_site - crawl a website from a seed URL through the local Crawl4AI server.

Follows same-host links from the seed to a bounded depth and page count, and
writes the result as artifacts on disk: one Markdown file per page, a JSON
manifest, and a Markdown summary. It prints a compact report only. Page
bodies never reach stdout, which is what makes a site crawl safe to run
inside a delegated subagent whose report must stay small.

Exit codes
  0  crawl completed and at least one page was written
  2  usage error
  3  seed URL refused by policy
  5  the seed could not be fetched, or no page was written
  7  Crawl4AI server unavailable or rejected the token
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import re
import sys
import time
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import read_url

ASSET_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".bmp",
    ".avif",
    ".css",
    ".js",
    ".mjs",
    ".map",
    ".json",
    ".xml",
    ".rss",
    ".atom",
    ".txt",
    ".zip",
    ".gz",
    ".tar",
    ".tgz",
    ".bz2",
    ".7z",
    ".rar",
    ".dmg",
    ".exe",
    ".mp3",
    ".mp4",
    ".m4a",
    ".wav",
    ".ogg",
    ".webm",
    ".mov",
    ".avi",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
}

DOCUMENT_SUFFIXES = {
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".odt",
    ".ods",
    ".odp",
    ".epub",
    ".rtf",
    ".csv",
}

MAX_BATCH = 100


# --------------------------------------------------------------------------
# link handling
# --------------------------------------------------------------------------


def normalize(url):
    """Drops the fragment and the trailing slash so duplicates collapse."""
    parsed = urllib.parse.urlsplit(url)
    path = parsed.path or "/"
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")
    return urllib.parse.urlunsplit(
        (parsed.scheme.lower(), parsed.netloc.lower(), path, parsed.query, "")
    )


def absolute(base, link):
    """Crawl4AI returns link objects ({"href": ...}); a bare string also works."""
    href = link.get("href") if isinstance(link, dict) else link
    if not isinstance(href, str) or not href.strip():
        return None
    try:
        return urllib.parse.urljoin(base, href.strip())
    except ValueError:
        return None


def suffix_of(url):
    path = urllib.parse.urlsplit(url).path.lower()
    return os.path.splitext(path)[1]


def same_site(url, seed_host, allow_subdomains):
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    if not host:
        return False
    if host == seed_host:
        return True
    return allow_subdomains and host.endswith("." + seed_host)


def keep_link(url, seed_host, args):
    """Returns (keep, reason) for a discovered link."""
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme not in ("http", "https"):
        return False, "scheme"
    if not same_site(url, seed_host, args.include_subdomains):
        return False, "offsite"
    suffix = suffix_of(url)
    if suffix in DOCUMENT_SUFFIXES:
        return False, "document"
    if suffix in ASSET_SUFFIXES:
        return False, "asset"
    if args.include and not re.search(args.include, url):
        return False, "include-filter"
    if args.exclude and re.search(args.exclude, url):
        return False, "exclude-filter"
    return True, "ok"


# --------------------------------------------------------------------------
# robots.txt
# --------------------------------------------------------------------------


def fetch_robots(seed, args, timeout=15.0):
    parsed = urllib.parse.urlsplit(seed)
    url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "/robots.txt", "", ""))
    try:
        response, _guard = read_url.open_with_agents(
            url, "GET", timeout, args.allow_private
        )
        with response:
            return response.read().decode("utf-8", "replace")
    except Exception:
        return ""


def parse_robots(text):
    """A deliberate subset: User-agent groups, Disallow, Allow, and * wildcards."""
    rules = []
    applies = False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip().lower()
        value = value.strip()
        if key == "user-agent":
            lowered = value.lower()
            applies = lowered == "*" or "read_url" in lowered or "crawl4ai" in lowered
        elif key in ("allow", "disallow") and applies and value:
            rules.append((key == "allow", value))
    return rules


def robots_allows(rules, url):
    if not rules:
        return True
    path = urllib.parse.urlsplit(url).path or "/"
    best_length = -1
    allowed = True
    for allow, pattern in rules:
        anchored = pattern.endswith("$")
        body = pattern[:-1] if anchored else pattern
        if "*" in body:
            regex = re.escape(body).replace(r"\*", ".*")
            if anchored:
                regex += "$"
            matched = re.match(regex, path) is not None
        elif anchored:
            matched = path == body
        else:
            matched = path.startswith(body)
        if matched and len(pattern) > best_length:
            best_length = len(pattern)
            allowed = allow
    return allowed


# --------------------------------------------------------------------------
# crawl configuration
# --------------------------------------------------------------------------


def crawl_config(args, timeout):
    config = {
        "cache_mode": read_url.CACHE_MODES[args.cache],
        "page_timeout": int(timeout * 1000),
        "word_count_threshold": 10,
        "verbose": False,
        "remove_overlay_elements": True,
        "exclude_external_links": True,
        "markdown_generator": {
            "type": "DefaultMarkdownGenerator",
            "params": {
                "content_filter": {
                    "type": "PruningContentFilter",
                    "params": {"threshold": args.prune_threshold},
                }
            },
        },
    }
    if args.wait_for:
        config["wait_for"] = args.wait_for
    return config


def extract(result, prefer_fit=True):
    markdown = result.get("markdown") or {}
    if isinstance(markdown, str):
        markdown = {"raw_markdown": markdown}
    if prefer_fit:
        text = markdown.get("fit_markdown") or markdown.get("raw_markdown") or ""
    else:
        text = markdown.get("raw_markdown") or markdown.get("fit_markdown") or ""
    metadata = result.get("metadata") or {}
    links = result.get("links") or {}
    internal = links.get("internal") or []
    return text, metadata.get("title"), internal


def pair_results(batch, results):
    """Pairs every requested URL with the result that actually fetched it.

    /crawl answers in completion order, not request order, so zipping the
    batch with the response hands each page another page's body and title.
    Every result names the URL it fetched; match on that, and fall back to
    position only for a result that arrived without one.
    """
    keyed = {}
    for position, result in enumerate(results):
        url = result.get("url")
        key = normalize(url) if isinstance(url, str) and url else ""
        if key:
            keyed.setdefault(key, []).append(position)
    used = set()
    pairs = []
    for url, depth in batch:
        index = None
        for position in keyed.get(normalize(url), []):
            if position not in used:
                index = position
                break
        if index is None:
            for position in range(len(results)):
                if position not in used:
                    index = position
                    break
        if index is None:
            pairs.append(((url, depth), None))
            continue
        used.add(index)
        pairs.append(((url, depth), results[index]))
    return pairs


# --------------------------------------------------------------------------
# output
# --------------------------------------------------------------------------


def slug_for(url, index):
    path = urllib.parse.urlsplit(url).path.strip("/").replace("/", "-") or "index"
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", path).strip("-")[:60] or "index"
    return "%03d-%s.md" % (index, cleaned)


def write_page(directory, index, url, title, depth, text, max_chars):
    body = text if max_chars <= 0 else text[:max_chars]
    name = slug_for(url, index)
    path = os.path.join(directory, name)
    header = [
        "---",
        "url: %s" % url,
        "title: %s" % (title or "").replace("\n", " ")[:200],
        "depth: %d" % depth,
        "chars: %d" % len(body),
        "untrusted: true",
        "---",
        "",
    ]
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(header) + body + "\n")
    return name


def save_page_html(directory, md_name, result):
    """Writes the rendered DOM and the filtered content DOM for --save-html.

    Uses the same slug as the Markdown file, minus the .md extension.
    Returns the number of characters written.
    """
    slug = md_name[:-3] if md_name.endswith(".md") else md_name
    written = 0
    html = result.get("html")
    if isinstance(html, str) and html:
        target = os.path.join(directory, slug + ".html")
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(html)
        written += len(html)
    markdown = result.get("markdown")
    fit_html = markdown.get("fit_html") if isinstance(markdown, dict) else None
    if isinstance(fit_html, str) and fit_html:
        target = os.path.join(directory, slug + ".content.html")
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(fit_html)
        written += len(fit_html)
    return written


def write_manifest(out_dir, manifest):
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, ensure_ascii=False)
    lines = [
        "# Crawl summary",
        "",
        "| Item | Value |",
        "| ---- | ----- |",
        "| Seed | `%s`" % manifest["seed"],
        "| Host | `%s`" % manifest["host"],
        "| Started | %s" % manifest["started"],
        "| Finished | %s" % manifest["finished"],
        "| Depth reached | %d of %d requested |"
        % (manifest["depth_reached"], manifest["options"]["depth"]),
        "| Pages written | %d |" % len(manifest["pages"]),
        "| Failed | %d |" % len(manifest["failed"]),
        "| Skipped | %d |" % len(manifest["skipped"]),
        "",
        "## Pages",
        "",
        "| Depth | URL | File | Chars |",
        "| ----- | --- | ---- | ----- |",
    ]
    for page in manifest["pages"]:
        lines.append(
            "| %d | `%s` | `%s` | %d |"
            % (page["depth"], page["url"], page["file"], page["chars"])
        )
    if manifest["failed"]:
        lines += ["", "## Failures", ""]
        for item in manifest["failed"]:
            lines.append("- `%s` - %s" % (item["url"], item["error"]))
    if manifest["skipped"]:
        lines += ["", "## Skipped", ""]
        for item in manifest["skipped"][:40]:
            lines.append("- `%s` - %s" % (item["url"], item["reason"]))
    with open(os.path.join(out_dir, "summary.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------


def build_parser():
    parser = argparse.ArgumentParser(
        prog="crawl_site",
        description="Crawl a website from a seed URL into Markdown files plus a "
        "manifest, using the local Crawl4AI server.",
    )
    parser.add_argument("seed", help="absolute http or https URL to start from")
    parser.add_argument(
        "--depth",
        type=int,
        default=1,
        help="hops to follow from the seed; 0 = seed only (default 1)",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=25,
        help="hard cap on pages fetched (default 25)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="URLs per /crawl request, 1..100 (default 10)",
    )
    parser.add_argument(
        "--out",
        default=None,
        help="output directory (default crawl-<host>-<timestamp>)",
    )
    parser.add_argument(
        "--include", default=None, help="only follow URLs matching this regex"
    )
    parser.add_argument(
        "--exclude", default=None, help="never follow URLs matching this regex"
    )
    parser.add_argument(
        "--include-subdomains",
        action="store_true",
        help="follow links into subdomains of the seed host",
    )
    parser.add_argument(
        "--ignore-robots",
        action="store_true",
        help="do not consult robots.txt (default: consult it)",
    )
    parser.add_argument(
        "--max-chars",
        type=int,
        default=50000,
        help="truncate each page file at this many characters; 0 disables",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=90.0,
        help="per-request timeout in seconds (default 90)",
    )
    parser.add_argument(
        "--delay-ms",
        type=int,
        default=0,
        help="sleep between batches, milliseconds (default 0)",
    )
    parser.add_argument(
        "--cache",
        choices=["bypass", "enabled", "readonly", "write", "disabled"],
        default="enabled",
        help="Crawl4AI cache mode (default enabled: a bulk crawl "
        "should not refetch what it already has)",
    )
    parser.add_argument(
        "--prune-threshold",
        type=float,
        default=0.48,
        help="PruningContentFilter threshold (default 0.48)",
    )
    parser.add_argument(
        "--wait-for", default=None, help="CSS selector to wait for on every page"
    )
    parser.add_argument(
        "--raw",
        action="store_true",
        help="keep the full DOM Markdown instead of readability output",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="skip URLs already listed in the output index.json",
    )
    parser.add_argument(
        "--save-html",
        action="append",
        default=None,
        metavar="DIR",
        help="also save each page's rendered DOM as DIR/<slug>.html and its "
        "filtered content DOM as DIR/<slug>.content.html (repeatable; last wins)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="resolve the seed and print the frontier; write nothing",
    )
    parser.add_argument("--json", action="store_true", help="print the report as JSON")
    parser.add_argument(
        "--allow-private",
        action="store_true",
        help="permit loopback and private-network targets",
    )
    return parser


def load_existing(out_dir):
    """Returns (pages, urls, pending) from an earlier run, for --resume."""
    path = os.path.join(out_dir, "index.json")
    if not os.path.isfile(path):
        return [], set(), []
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return [], set(), []
    pages = data.get("pages") or []
    pending = [item for item in (data.get("pending") or []) if isinstance(item, dict)]
    return pages, {page["url"] for page in pages}, pending


def report(args, manifest, out_dir):
    pages = manifest["pages"]
    failed = manifest["failed"]
    skipped = manifest["skipped"]
    documents = sum(1 for item in skipped if item["reason"] == "document")
    if args.json:
        print(
            json.dumps(
                {
                    "seed": manifest["seed"],
                    "host": manifest["host"],
                    "pages": len(pages),
                    "failed": len(failed),
                    "skipped": len(skipped),
                    "documents_skipped": documents,
                    "depth_reached": manifest["depth_reached"],
                    "depth_requested": manifest["options"]["depth"],
                    "out_dir": out_dir,
                    "manifest": os.path.join(out_dir, "index.json"),
                    "summary": os.path.join(out_dir, "summary.md"),
                    "page_urls": [page["url"] for page in pages],
                    "failures": failed[:10],
                    "pending": len(manifest.get("pending") or []),
                    "elapsed_s": manifest["elapsed_s"],
                },
                indent=2,
                ensure_ascii=False,
            )
        )
        return
    print("crawl:    %s" % manifest["host"])
    print("seed:     %s" % manifest["seed"])
    print(
        "depth:    %d reached of %d requested"
        % (manifest["depth_reached"], manifest["options"]["depth"])
    )
    print(
        "pages:    %d written   failed: %d   skipped: %d"
        % (len(pages), len(failed), len(skipped))
    )
    if documents:
        print(
            "documents: %d found and skipped; read one at a time with read_url.py"
            % documents
        )
    print("elapsed:  %.1fs" % manifest["elapsed_s"])
    print("output:   %s" % out_dir)
    print("manifest: %s" % os.path.join(out_dir, "index.json"))
    if args.save_html:
        print(
            "html:     %d chars -> %s"
            % (manifest.get("html_chars", 0), args.save_html[-1])
        )
    pending = manifest.get("pending") or []
    if pending:
        print("pending:  %d urls left; re-run with --resume to continue" % len(pending))
    for item in failed[:5]:
        print("FAILED:   %s (%s)" % (item["url"], item["error"]))


def main(argv):
    args = build_parser().parse_args(argv)
    started = time.time()

    if args.depth < 0 or args.depth > 10:
        print("crawl_site: --depth must be 0..10", file=sys.stderr)
        return read_url.EXIT_USAGE
    if args.max_pages < 1:
        print("crawl_site: --max-pages must be positive", file=sys.stderr)
        return read_url.EXIT_USAGE
    if not 1 <= args.batch_size <= MAX_BATCH:
        print("crawl_site: --batch-size must be 1..%d" % MAX_BATCH, file=sys.stderr)
        return read_url.EXIT_USAGE

    try:
        read_url.validate_url(args.seed, args.allow_private)
        read_url.check_health(read_url.resolve_server())
        token, _origin = read_url.resolve_token()

        seed = normalize(args.seed)
        seed_host = (urllib.parse.urlsplit(seed).hostname or "").lower()
        stamp = time.strftime("%Y%m%d-%H%M%S")
        out_dir = args.out or os.path.join(
            os.getcwd(),
            "crawl-%s-%s" % (re.sub(r"[^A-Za-z0-9.-]", "-", seed_host), stamp),
        )
        config = crawl_config(args, args.timeout)

        rules = [] if args.ignore_robots else parse_robots(fetch_robots(seed, args))
        if rules and not robots_allows(rules, seed):
            print(
                "crawl_site: robots.txt disallows the seed %s" % seed, file=sys.stderr
            )
            print(
                "crawl_site: hint: pass --ignore-robots only with the site "
                "owner's permission",
                file=sys.stderr,
            )
            return read_url.EXIT_REFUSED

        pages, done, saved_pending = (
            load_existing(out_dir) if args.resume else ([], set(), [])
        )
        if saved_pending:
            queue = collections.deque(
                (item["url"], int(item.get("depth", 1))) for item in saved_pending
            )
        else:
            queue = collections.deque([(seed, 0)])
        seen = set(done) | {url for url, _depth in queue} | {seed}
        failed = []
        skipped = []
        depth_reached = 0
        html_dir = args.save_html[-1] if args.save_html else None
        html_chars = 0

        if args.dry_run:
            results = read_url.post_crawl_many([seed], config, token, args.timeout)
            result = results[0] if results else None
            if not result or not result.get("success"):
                print("crawl_site: seed fetch failed", file=sys.stderr)
                return read_url.EXIT_CRAWL
            _text, _title, internal = extract(result, not args.raw)
            candidates = []
            for href in internal:
                url = absolute(seed, href)
                if not url:
                    continue
                url = normalize(url)
                if url in seen:
                    continue
                seen.add(url)
                ok, reason = keep_link(url, seed_host, args)
                if ok:
                    candidates.append(url)
                else:
                    skipped.append({"url": url, "reason": reason})
            print(
                "dry run: seed ok, %d crawlable links on the seed page "
                "(depth-1 frontier only, NOT a site total), %d skipped"
                % (len(candidates), len(skipped))
            )
            for url in candidates[:25]:
                print("  %s" % url)
            return read_url.EXIT_OK

        os.makedirs(os.path.join(out_dir, "pages"), exist_ok=True)
        pages_dir = os.path.join(out_dir, "pages")
        index = len(pages)

        while queue and len(pages) < args.max_pages:
            batch = []
            while (
                queue
                and len(batch) < args.batch_size
                and len(pages) + len(batch) < args.max_pages
            ):
                url, depth = queue.popleft()
                if url in done:
                    continue
                batch.append((url, depth))
            if not batch:
                break
            results = read_url.post_crawl_many(
                [url for url, _depth in batch], config, token, args.timeout
            )
            for (url, depth), result in pair_results(batch, results):
                if result is None:
                    failed.append({"url": url, "error": "no result for this URL"})
                    continue
                if not result.get("success"):
                    failed.append(
                        {
                            "url": url,
                            "error": (result.get("error_message") or "crawl failed")[
                                :200
                            ],
                        }
                    )
                    continue
                text, title, internal = extract(result, not args.raw)
                if not text.strip():
                    failed.append({"url": url, "error": "empty Markdown"})
                    continue
                index += 1
                name = write_page(
                    pages_dir, index, url, title, depth, text, args.max_chars
                )
                if html_dir:
                    try:
                        os.makedirs(html_dir, exist_ok=True)
                        html_chars += save_page_html(html_dir, name, result)
                    except OSError as error:
                        print(
                            "crawl_site: cannot save html for %s: %s" % (url, error),
                            file=sys.stderr,
                        )
                pages.append(
                    {
                        "url": url,
                        "file": os.path.join("pages", name),
                        "title": title or "",
                        "depth": depth,
                        "chars": len(text),
                        "status": result.get("status_code"),
                    }
                )
                if depth < args.depth:
                    for href in internal:
                        candidate = absolute(url, href)
                        if not candidate:
                            continue
                        candidate = normalize(candidate)
                        if candidate in seen:
                            continue
                        seen.add(candidate)
                        ok, reason = keep_link(candidate, seed_host, args)
                        if not ok:
                            skipped.append({"url": candidate, "reason": reason})
                            continue
                        if rules and not robots_allows(rules, candidate):
                            skipped.append(
                                {"url": candidate, "reason": "robots-disallow"}
                            )
                            continue
                        queue.append((candidate, depth + 1))
            depth_reached = max([depth_reached] + [depth for _url, depth in batch])
            if args.delay_ms > 0 and queue:
                time.sleep(args.delay_ms / 1000.0)

        manifest = {
            "seed": seed,
            "host": seed_host,
            "started": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(started)),
            "finished": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "elapsed_s": round(time.time() - started, 2),
            "depth_reached": depth_reached,
            "options": {
                "depth": args.depth,
                "max_pages": args.max_pages,
                "include_subdomains": args.include_subdomains,
                "include": args.include,
                "exclude": args.exclude,
                "robots": not args.ignore_robots,
                "cache": args.cache,
            },
            "pages": pages,
            "failed": failed,
            "skipped": skipped,
            "pending": [{"url": url, "depth": depth} for url, depth in queue],
        }
        if html_dir:
            manifest["html_dir"] = html_dir
            manifest["html_chars"] = html_chars
        write_manifest(out_dir, manifest)
        report(args, manifest, out_dir)

        if not pages:
            print("crawl_site: no page was written", file=sys.stderr)
            return read_url.EXIT_CRAWL
        return read_url.EXIT_OK

    except read_url.Failure as error:
        print("crawl_site: %s" % error.message, file=sys.stderr)
        if error.hint:
            print("crawl_site: hint: %s" % error.hint, file=sys.stderr)
        return error.code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
