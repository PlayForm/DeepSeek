#!/usr/bin/env python3
"""audit_crawl - report the Markdown defects in a Crawl4AI output directory.

Reads the pages a crawl wrote and counts the artifacts that make a page look
like Markdown without being usable: zero-width characters inside heading
anchors, navigation and footer boilerplate, tables whose rows lost cells,
unbalanced or language-less code fences, error pages, raw HTML, heading-level
damage, and over-long lines. It prints counts and a file:line example per
class, never page bodies.

Per-page Markdown structure - headings, code fences, tables, raw HTML,
invisible characters, and the lexical scans - is delegated to the
source-pipeline Audit API, which parses the document instead of matching
patterns. The crawl-level checks (stub pages, truncation, metadata agreement,
duplicate bodies, provenance) stay local.

A file is audited when it sits under a `pages/` directory or carries the
crawler provenance line `untrusted: true`. Repository prose and hand-wrapped
captures are counted separately and skipped; pass --all to include them.

Exit codes
  0  scan completed (defects are reported, not fatal)
  2  usage error
  4  --strict and at least one defect class fired
  5  no auditable Markdown found under the target
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys

sys.path.insert(
    0,
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "source-pipeline",
        "scripts",
    ),
)

from audit_markdown import Audit

EXIT_OK = 0
EXIT_USAGE = 2
EXIT_STRICT = 4
EXIT_EMPTY = 5

DEFAULT_MIN_CHARS = 300
DEFAULT_LONG_LINE = 1000
DEFAULT_EXAMPLES = 2

INVISIBLE = {
    0x200B: "zwsp",
    0x200C: "zwnj",
    0x200D: "zwj",
    0x2060: "word-joiner",
    0xFEFF: "bom",
    0x00AD: "soft-hyphen",
    0x180E: "mongolian-vowel-separator",
}

BOILERPLATE = (
    ("on-this-page", re.compile(r"^On this page\s*$", re.IGNORECASE)),
    ("table-of-contents", re.compile(r"^Table of contents\s*$", re.IGNORECASE)),
    ("back-to-top", re.compile(r"^Back to top\s*$", re.IGNORECASE)),
    ("was-this-helpful", re.compile(r"^Was this (page )?helpful\?", re.IGNORECASE)),
    ("skip-to-content", re.compile(r"^Skip to (main )?content\s*$", re.IGNORECASE)),
    ("copy-markdown", re.compile(r"^(Copy|View) Markdown\s*$", re.IGNORECASE)),
    ("ask-assistant", re.compile(r"^(Ask Gordon|Start a new chat|Try asking)\s*$")),
    (
        "generated-answers",
        re.compile(r"^Answers are generated based on", re.IGNORECASE),
    ),
    ("show-more", re.compile(r"^Show more\s*$", re.IGNORECASE)),
    ("edit-this-page", re.compile(r"^Edit this page\s*$", re.IGNORECASE)),
    ("prev-next", re.compile(r"^(Previous|Next)( page| article)?\s*$", re.IGNORECASE)),
    ("prev-next-link", re.compile(r"^\[(Previous|Next)[^\]]*\]\([^)]+\)\s*$")),
    ("cookie-banner", re.compile(r"^(Accept all cookies|Cookie settings)\s*$", re.I)),
    ("empty-anchor-breadcrumb", re.compile(r"^\s*[-*+]\s*\[\]\([^)]+\)\s*$")),
)

ERROR_PATTERNS = (
    re.compile(r"this page crashed", re.IGNORECASE),
    re.compile(r"page not found", re.IGNORECASE),
    re.compile(r"\b404\b.{0,40}(not found|error)", re.IGNORECASE),
    re.compile(r"application error", re.IGNORECASE),
    re.compile(r"just a moment\.\.\.", re.IGNORECASE),
    re.compile(r"access denied", re.IGNORECASE),
    re.compile(r"enable javascript", re.IGNORECASE),
    re.compile(r"service (temporarily )?unavailable", re.IGNORECASE),
    re.compile(r"bad gateway", re.IGNORECASE),
    re.compile(r"net::err_", re.IGNORECASE),
    re.compile(r"something went wrong", re.IGNORECASE),
    re.compile(r"you don't have permission to access", re.IGNORECASE),
)

FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
HEADING_RE = re.compile(r"^(#{1,6})[ \t]+(.*?)[ \t]*$")
COLLAPSED_RE = re.compile(r"^#{1,6}[ \t].*?#{2,6}[ \t]")
URL_RE = re.compile(r"\((https?://[^)\s]+)")
WHOLE_LINK_RE = re.compile(r"^\[([^\]]+)\]\((https?://[^)\s]+)[^)]*\)\s*$")
DIRECT_LINK_RE = re.compile(r"\"Direct link to [^\"]*\"")
FRONTMATTER_KEY_RE = re.compile(r"^([A-Za-z0-9_.-]+):\s*(.*)$")
INVISIBLE_CLASS = "[" + "".join(re.escape(chr(code)) for code in INVISIBLE) + "]"
ANCHOR_INVISIBLE_RE = re.compile(r"\]" + INVISIBLE_CLASS + r"\(")

CLASS_SPECS = (
    ("invisible", "zero-width and invisible characters", "strip in a post-pass"),
    ("heading-anchor", "heading anchor self-links", "strip in a post-pass"),
    ("heading-duplicate", "duplicate heading text", "post-pass dedupe"),
    ("boilerplate", "navigation and footer boilerplate", "post-pass blocklist"),
    ("table-row-mismatch", "table row cell-count mismatch", "re-crawl raw, then fix"),
    ("table-escaped-pipe", "escaped pipes inside table cells", "post-pass unescape"),
    ("fence-unclosed", "unclosed code fence", "post-pass repair, then re-crawl"),
    ("fence-no-language", "code fence without a language", "post-pass or ignore"),
    ("fence-blank-padded", "blank lines injected in code fences", "post-pass trim"),
    ("code-non-ascii", "non-ASCII inside code blocks", "post-pass transliterate"),
    ("raw-html", "raw HTML remnants", "re-crawl raw, then strip"),
    ("stub-page", "stub or error page", "re-fetch the page individually"),
    ("heading-no-h1", "page without an H1", "ignore or repair in post-pass"),
    ("heading-multi-h1", "page with several H1s", "post-pass demote"),
    ("heading-jump", "heading level jump", "ignore or repair in post-pass"),
    ("heading-collapsed", "headings collapsed onto one line", "post-pass split"),
    ("long-line", "absurdly long lines", "ignore; it is paragraph text"),
    ("truncated-page", "page cut off at the character cap", "raise --max-chars"),
    ("metadata-mismatch", "body belongs to another URL", "re-crawl; do not trust it"),
    ("duplicate-body", "duplicate page body", "re-crawl; do not trust it"),
    (
        "provenance-missing",
        "page without a provenance block",
        "re-fetch with the script",
    ),
)


class Report(object):
    """Collects one count per defect class, with capped file:line examples."""

    def __init__(self, max_examples):
        self.max_examples = max_examples
        self.order = [spec[0] for spec in CLASS_SPECS]
        self.label = {spec[0]: spec[1] for spec in CLASS_SPECS}
        self.remedy = {spec[0]: spec[2] for spec in CLASS_SPECS}
        self.pages = {key: set() for key in self.order}
        self.hits = {key: 0 for key in self.order}
        self.examples = {key: [] for key in self.order}

    def hit(self, key, rel, lineno, note=""):
        self.hits[key] += 1
        self.pages[key].add(rel)
        bucket = self.examples[key]
        if len(bucket) < self.max_examples:
            bucket.append((rel, lineno, note))

    def fired(self):
        return [key for key in self.order if self.hits[key] > 0]


class Page(object):
    def __init__(self, path, rel):
        self.path = path
        self.rel = rel
        self.lines = []
        self.meta = {}
        self.body_start = 0
        self.crawler = False
        self.body = ""
        self.fences = []
        self.anchor_urls = []
        self.in_pages = False


def load_page(path, rel):
    page = Page(path, rel)
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        text = handle.read()
    page.lines = text.splitlines()
    if page.lines and page.lines[0].strip() == "---":
        for index in range(1, min(len(page.lines), 60)):
            line = page.lines[index]
            if line.strip() == "---":
                page.body_start = index + 1
                break
            match = FRONTMATTER_KEY_RE.match(line)
            if match:
                page.meta[match.group(1).lower()] = match.group(2).strip()
    page.crawler = page.meta.get("untrusted", "").lower() == "true"
    page.body = "\n".join(page.lines[page.body_start :])
    return page


def parse_fences(page):
    """Pairs fence markers so the retained checks can skip fenced lines."""
    blocks = []
    open_block = None
    for index in range(page.body_start, len(page.lines)):
        line = page.lines[index]
        match = FENCE_RE.match(line)
        if open_block is None:
            if match:
                marker = match.group(1)
                open_block = {
                    "start": index,
                    "marker": marker,
                    "info": match.group(2).strip(),
                    "content_start": index + 1,
                    "end": None,
                }
            continue
        if match and match.group(1)[0] == open_block["marker"][0]:
            if len(match.group(1)) >= len(open_block["marker"]):
                if not match.group(2).strip():
                    open_block["end"] = index
                    blocks.append(open_block)
                    open_block = None
    if open_block is not None:
        open_block["end"] = len(page.lines)
        open_block["unclosed"] = True
        blocks.append(open_block)
    for block in blocks:
        block.setdefault("unclosed", False)
    page.fences = blocks


def fence_mask(page):
    """True for a line inside a fence, closing markers included."""
    mask = [False] * len(page.lines)
    for block in page.fences:
        for index in range(block["start"], min(block["end"] + 1, len(page.lines))):
            mask[index] = True
    return mask


def collect_anchor_urls(page, mask):
    """Feeds metadata-mismatch: URLs that headings link to.

    The Audit API owns the heading-anchor finding; this only gathers the
    self-URLs the metadata check compares against the frontmatter URL.
    """
    for index in range(page.body_start, len(page.lines)):
        if mask[index]:
            continue
        line = page.lines[index]
        match = HEADING_RE.match(line)
        if not match:
            continue
        text = match.group(2)
        anchor = (
            DIRECT_LINK_RE.search(line)
            or (WHOLE_LINK_RE.match(text) and "#" in text)
            or ANCHOR_INVISIBLE_RE.search(line)
        )
        if anchor:
            for url in URL_RE.finditer(text):
                page.anchor_urls.append(url.group(1))


def check_markdown(page, report, long_line=DEFAULT_LONG_LINE):
    """One parsed-tree audit per page; every Audit kind names a Report class.

    Audit reports lines relative to the body text it was given, so each line
    is shifted by the body offset to stay a file line. Kinds the API reports
    without a line (page-level findings) use the first body line.
    """
    body = "\n".join(page.lines[page.body_start :])
    result = (
        Audit(body, long_line=long_line)
        .headings()
        .fences()
        .tables()
        .raw_html()
        .invisible()
        .lexical()
        .report()
    )
    for finding in result["findings"]:
        line = finding["line"] if finding["line"] else 1
        report.hit(finding["kind"], page.rel, page.body_start + line, finding["detail"])


def check_boilerplate(page, report, mask):
    for index in range(page.body_start, len(page.lines)):
        if mask[index]:
            continue
        line = page.lines[index].strip()
        if not line or len(line) > 120:
            continue
        for label, pattern in BOILERPLATE:
            if pattern.match(line):
                report.hit("boilerplate", page.rel, index + 1, label)
                break


def check_collapsed(page, report, mask):
    for index in range(page.body_start, len(page.lines)):
        if mask[index]:
            continue
        if COLLAPSED_RE.match(page.lines[index]):
            report.hit(
                "heading-collapsed",
                page.rel,
                index + 1,
                "two or more headings on one line",
            )


def check_stub(page, report, min_chars):
    body = page.body.strip()
    if len(body) < min_chars:
        report.hit(
            "stub-page", page.rel, page.body_start + 1, "%d body chars" % len(body)
        )
        return
    if len(body) > 4000:
        return
    for pattern in ERROR_PATTERNS:
        match = pattern.search(body)
        if match:
            report.hit(
                "stub-page",
                page.rel,
                page.body_start + 1,
                "reads like a browser error: %r" % match.group(0)[:40],
            )
            return


def check_metadata(page, report):
    """A page whose headings all link to another path was captured wrongly."""
    if len(page.anchor_urls) < 2:
        return
    counts = {}
    for url in page.anchor_urls:
        path = url.split("#", 1)[0].rstrip("/").lower()
        counts[path] = counts.get(path, 0) + 1
    dominant, hits = max(counts.items(), key=lambda item: item[1])
    total = sum(counts.values())
    if hits < 2 or hits * 2 < total:
        return
    own = page.meta.get("url", "").rstrip("/").lower()
    if own and dominant != own:
        report.hit(
            "metadata-mismatch",
            page.rel,
            page.body_start + 1,
            "headings link to %s, frontmatter says %s" % (dominant, own),
        )


def check_duplicate_body(page, report, digest_index):
    body = page.body.strip()
    if len(body) < 200:
        return
    digest = hashlib.sha1(" ".join(body.split()).encode("utf-8")).hexdigest()
    if digest in digest_index:
        report.hit(
            "duplicate-body",
            page.rel,
            page.body_start + 1,
            "identical to %s" % digest_index[digest],
        )
        return
    digest_index[digest] = page.rel


def check_truncation(page, report):
    """A body that stops at a round cap, mid-token, was cut by --max-chars."""
    body = page.body.strip()
    length = len(body)
    if length < 40000 or length % 1000:
        return
    if not body or not body[-1].isalnum():
        return
    report.hit(
        "truncated-page",
        page.rel,
        len(page.lines),
        "%d chars, ends mid-token" % length,
    )


def check_provenance(page, report):
    """A page under pages/ without the header cannot be traced to its URL."""
    if not page.in_pages or page.crawler:
        return
    report.hit(
        "provenance-missing",
        page.rel,
        1,
        "no url/title/untrusted block",
    )


def audit_page(page, report, args, digest_index):
    parse_fences(page)
    mask = fence_mask(page)
    collect_anchor_urls(page, mask)
    check_markdown(page, report, args.long_line)
    check_boilerplate(page, report, mask)
    check_collapsed(page, report, mask)
    check_stub(page, report, args.min_chars)
    check_truncation(page, report)
    check_metadata(page, report)
    check_provenance(page, report)
    check_duplicate_body(page, report, digest_index)


def discover(root):
    """Sorted (path, relative path) pairs for every Markdown file."""
    found = []
    for directory, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(name for name in dirnames if not name.startswith("."))
        for name in sorted(filenames):
            if name.startswith(".") or not name.lower().endswith(".md"):
                continue
            path = os.path.join(directory, name)
            found.append((path, os.path.relpath(path, root)))
    return found


def source_of(rel):
    parts = rel.split(os.sep)
    return parts[0] if len(parts) > 1 else "(root)"


def print_report(args, root, report, pages, skipped, sources, stats):
    fired = report.fired()
    width = max(len(report.label[key]) for key in report.order)
    print("audit:    %s" % os.path.abspath(root))
    print(
        "files:    %d markdown, %d audited, %d skipped (no crawler provenance)"
        % (pages + skipped, pages, skipped)
    )
    if sources:
        detail = ", ".join("%s %d" % item for item in sorted(sources.items()))
        print("sources:  %s" % detail)
    print(
        "volume:   %d body characters, %d lines, longest line %d"
        % (stats["chars"], stats["lines"], stats["longest"])
    )
    print("")
    header = "%-*s  %5s  %5s  %s" % (width, "class", "pages", "hits", "example")
    print(header)
    print("-" * len(header))
    for key in report.order:
        hits = report.hits[key]
        if not hits:
            continue
        example = report.examples[key][0] if report.examples[key] else None
        where = ""
        if example:
            where = "%s:%d" % (example[0], example[1])
            if example[2]:
                where += "  (%s)" % example[2]
        print(
            "%-*s  %5d  %5d  %s"
            % (width, report.label[key], len(report.pages[key]), hits, where)
        )
        for extra in report.examples[key][1:]:
            detail = "%s:%d" % (extra[0], extra[1])
            if extra[2]:
                detail += "  (%s)" % extra[2]
            print("%-*s  %5s  %5s  %s" % (width, "", "", "", detail))
    print("")
    clean = [key for key in report.order if not report.hits[key]]
    print(
        "classes:  %d fired, %d clean%s"
        % (
            len(fired),
            len(clean),
            "" if not clean else " (" + ", ".join(clean) + ")",
        )
    )
    if args.strict and fired:
        print("strict:   defects found; exiting 4", file=sys.stderr)
    else:
        print("result:   scan complete; defects are reported, not fatal")


def print_json(root, report, pages, skipped, sources, stats):
    payload = {
        "root": os.path.abspath(root),
        "pages_audited": pages,
        "pages_skipped": skipped,
        "sources": sources,
        "volume": stats,
        "classes": [
            {
                "key": key,
                "label": report.label[key],
                "pages": len(report.pages[key]),
                "hits": report.hits[key],
                "remedy": report.remedy[key],
                "examples": [
                    {"file": rel, "line": line, "note": note}
                    for rel, line, note in report.examples[key]
                ],
            }
            for key in report.order
        ],
        "fired": report.fired(),
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def build_parser():
    parser = argparse.ArgumentParser(
        prog="audit_crawl",
        description="Report the Markdown defects in a Crawl4AI output directory.",
    )
    parser.add_argument(
        "root", nargs="?", default=".", help="crawl output directory (default .)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="audit every Markdown file, not only crawl pages",
    )
    parser.add_argument(
        "--min-chars",
        type=int,
        default=DEFAULT_MIN_CHARS,
        help="body length under which a page counts as a stub (default 300)",
    )
    parser.add_argument(
        "--long-line",
        type=int,
        default=DEFAULT_LONG_LINE,
        help="line length that counts as absurd (default 1000)",
    )
    parser.add_argument(
        "--max-examples",
        type=int,
        default=DEFAULT_EXAMPLES,
        help="examples printed per class (default 2)",
    )
    parser.add_argument("--json", action="store_true", help="print the report as JSON")
    parser.add_argument(
        "--strict", action="store_true", help="exit 4 when any defect class fires"
    )
    return parser


def main(argv):
    args = build_parser().parse_args(argv)
    root = args.root
    if not os.path.isdir(root):
        print("audit_crawl: not a directory: %s" % root, file=sys.stderr)
        return EXIT_USAGE
    if args.max_examples < 0 or args.min_chars < 0 or args.long_line < 1:
        print("audit_crawl: negative or zero limit", file=sys.stderr)
        return EXIT_USAGE

    report = Report(args.max_examples)
    digest_index = {}
    sources = {}
    stats = {"chars": 0, "lines": 0, "longest": 0}
    pages = 0
    skipped = 0

    for path, rel in discover(root):
        page = load_page(path, rel)
        in_pages_dir = "pages" in rel.split(os.sep)[:-1]
        if not (page.crawler or in_pages_dir) and not args.all:
            skipped += 1
            continue
        page.in_pages = in_pages_dir
        pages += 1
        source = source_of(rel)
        sources[source] = sources.get(source, 0) + 1
        stats["chars"] += len(page.body)
        stats["lines"] += len(page.lines)
        for line in page.lines:
            if len(line) > stats["longest"]:
                stats["longest"] = len(line)
        audit_page(page, report, args, digest_index)

    if not pages:
        print("audit_crawl: no auditable Markdown under %s" % root, file=sys.stderr)
        return EXIT_EMPTY

    if args.json:
        print_json(root, report, pages, skipped, sources, stats)
    else:
        print_report(args, root, report, pages, skipped, sources, stats)

    if args.strict and report.fired():
        return EXIT_STRICT
    return EXIT_OK


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
