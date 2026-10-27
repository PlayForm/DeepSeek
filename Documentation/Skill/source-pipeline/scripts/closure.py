"""Prove link coverage for an archived documentation site.

    Links(archive, manifest).collect().classify().write(out).report()

Every full-DOM page in the archive is folded depth-first for its anchors -
the same fold the HTML cleaner and the Markdown auditor use - and each href
is normalized to a site path and classified against the crawl manifest:
archived, placeholder, external, or missing. The missing ones are the real
gaps; the optional fetch stage closes them through read_url.py into the 900-
range of the archive and re-classifies until a round lands nothing new.

No regex touches the markup: BeautifulSoup walks the tree, json handles the
data. The coverage fraction counts site targets only - archived plus
placeholder over archived plus placeholder plus missing; external URLs are
not part of the site and are reported separately.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from urllib.parse import urlsplit

from bs4 import BeautifulSoup

DEFAULT_PREFIX = "900-"
DEFAULT_SOURCE_CAP = 5
DEFAULT_MAX_ROUNDS = 3
DEFAULT_MAX_FETCH = 50
# Resolved from this file's own location, which the harness provides: the
# crawl4ai skill is installed beside this one. No absolute path is baked in.
DEFAULT_READ_URL = os.path.normpath(
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        os.pardir,
        os.pardir,
        "crawl4ai",
        "scripts",
        "read_url.py",
    )
)


def fold(node, visit, seed=None):
    """Depth-first map-reduce over elements: visit(element, acc) -> acc."""
    acc = visit(node, seed)
    for child in list(node.children):
        if getattr(child, "name", None):
            acc = fold(child, visit, acc)
    return acc


def target_of(href, host):
    """One href as (kind, key): a site path, an external URL, or no target.

    An absolute URL on another host is external. A root-absolute path (one
    slash, never two) is a site path; urlsplit drops its fragment and query
    and the trailing slash goes too, so "/" becomes "". Fragments, mailto,
    javascript and bare relative links are not page targets.
    """
    parsed = urlsplit(href)
    if parsed.scheme and parsed.scheme not in ("http", "https"):
        return None, ""
    if parsed.netloc and parsed.netloc != host:
        return "external", href.split("#", 1)[0]
    path = parsed.path
    if not path.startswith("/") or path.startswith("//"):
        return None, ""
    return "site", path.rstrip("/")


def is_placeholder(path):
    """An API template, not a real path: brace parameters or doubled underscores."""
    return "{" in path or "}" in path or "__" in path


def slug_for(path):
    """The archive slug for a site path, in the shape the crawl used."""
    cleaned = "".join(ch if ch.isalnum() or ch in "._-" else "-" for ch in path.strip("/"))
    return cleaned.strip("-") or "index"


def archived_paths(manifest, host):
    """The site paths the crawl recorded, keyed the same way as targets."""
    with open(manifest, encoding="utf-8") as handle:
        pages = json.load(handle).get("pages") or []
    covered = set()
    for page in pages:
        kind, key = target_of(page.get("url", ""), host)
        if kind == "site":
            covered.add(key)
    return covered


class Links:
    """Chainable link-graph build over an archived HTML directory."""

    def __init__(
        self,
        directory,
        manifest,
        host,
        read_url=DEFAULT_READ_URL,
        staging=None,
        prefix=DEFAULT_PREFIX,
        source_cap=DEFAULT_SOURCE_CAP,
        max_rounds=DEFAULT_MAX_ROUNDS,
        max_fetch=DEFAULT_MAX_FETCH,
    ):
        self.directory = directory
        self.host = host
        self.read_url = read_url
        self.staging = staging or os.path.join(tempfile.gettempdir(), "closure")
        self.prefix = prefix
        self.source_cap = source_cap
        self.max_rounds = max_rounds
        self.max_fetch = max_fetch
        self.covered = archived_paths(manifest, host)
        self.files = []
        self.targets = {}
        self.attempted = set()
        self.fetched = []
        self.log = []

    def collect(self):
        """Fold the anchors of every full-DOM page into the target table."""
        self.files = sorted(
            name
            for name in os.listdir(self.directory)
            if name.endswith(".html") and not name.endswith(".content.html")
        )
        self.targets = {}
        for name in self.files:
            self._collect_page(name)
        return self

    def _collect_page(self, name):
        with open(os.path.join(self.directory, name), encoding="utf-8") as handle:
            soup = BeautifulSoup(handle.read(), "html.parser")
        source = os.path.splitext(name)[0]

        def visit(element, _acc):
            href = element.get("href") if element.name == "a" else None
            if href:
                self._record(href, source)
            return _acc

        fold(soup, visit)

    def _record(self, href, source):
        kind, key = target_of(href, self.host)
        if not kind:
            return
        entry = self.targets.get(key)
        if entry is None:
            entry = self.targets[key] = {
                "kind": kind,
                "path": key,
                "count": 0,
                "sources": [],
            }
        entry["count"] += 1
        if source not in entry["sources"] and len(entry["sources"]) < self.source_cap:
            entry["sources"].append(source)

    def classify(self):
        """Give every target its final status against the covered set."""
        for entry in self.targets.values():
            if entry["kind"] == "external":
                entry["status"] = "external"
            elif self._archived(entry["path"]):
                entry["status"] = "archived"
            elif is_placeholder(entry["path"]):
                entry["status"] = "placeholder"
            else:
                entry["status"] = "missing"
        return self

    def write(self, path=None):
        path = path or os.path.join(
            os.path.dirname(os.path.abspath(self.directory)), "Links.json"
        )
        payload = {
            "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "archive_pages": len(self.files),
            "targets": [
                {
                    "path": entry["path"],
                    "status": entry["status"],
                    "count": entry["count"],
                    "sources": entry["sources"],
                }
                for _, entry in sorted(self.targets.items())
            ],
        }
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        return self

    def fetch(self):
        """Close the missing targets through read_url, then re-classify.

        Each round fetches the missing site paths not settled yet, renames
        the produced DOM into the 900- range, and folds the successes into
        the covered set so their own links join the next round. Stops when
        a round lands nothing, after MAX_ROUNDS rounds, or at MAX_FETCH.
        """
        os.makedirs(self.staging, exist_ok=True)
        for _ in range(self.max_rounds):
            self.collect().classify()
            todo = self._pending()
            if not todo:
                break
            landed = 0
            for path in todo:
                if len(self.fetched) >= self.max_fetch:
                    break
                if self._fetch_one(path):
                    landed += 1
            if not landed:
                break
        self.collect().classify()
        return self

    def _archived(self, path):
        """In the crawl manifest, or already closed into the 900- range."""
        return path in self.covered or os.path.exists(
            os.path.join(self.directory, self.prefix + slug_for(path) + ".html")
        )

    def _pending(self):
        """The missing site paths this run has not settled yet."""
        todo = []
        for entry in self.targets.values():
            if entry["status"] != "missing":
                continue
            if entry["path"] not in self.attempted:
                todo.append(entry["path"])
        return sorted(todo)

    def _fetch_one(self, path):
        """Fetch one missing path through read_url; True when it archived."""
        self.attempted.add(path)
        slug = slug_for(path)
        completed = subprocess.run(
            [
                sys.executable,
                self.read_url,
                "https://%s%s" % (self.host, path),
                "--max-chars", "40000",
                "--out", os.path.join(self.staging, slug + ".md"),
                "--save-html", self.directory,
                "--json",
            ],
            capture_output=True,
            text=True,
        )
        if completed.returncode != 0:
            self.log.append("fetch failed: %s (exit %d)" % (path, completed.returncode))
            return False
        status = self._status_of(completed.stdout)
        if status not in (None, 200):
            self._discard(slug)
            self.log.append("fetch refused: %s (HTTP %s, not archived)" % (path, status))
            return False
        promoted = self._promote(slug)
        if not promoted:
            self.log.append("fetch empty: %s (no DOM saved)" % path)
            return False
        self.covered.add(path)
        self.fetched.append(path)
        self.log.append("fetched: %s -> %s" % (path, ", ".join(promoted)))
        return True

    def _status_of(self, stdout):
        try:
            return json.loads(stdout).get("status_code")
        except ValueError:
            return None

    def _promote(self, slug):
        """Rename the produced DOM files into the 900- closure range."""
        promoted = []
        for suffix in (".html", ".content.html"):
            produced = os.path.join(self.directory, slug + suffix)
            if os.path.exists(produced):
                final = self.prefix + slug + suffix
                os.replace(produced, os.path.join(self.directory, final))
                promoted.append(final)
        return promoted

    def _discard(self, slug):
        """Drop the DOM of a page that did not serve real content."""
        for suffix in (".html", ".content.html"):
            produced = os.path.join(self.directory, slug + suffix)
            if os.path.exists(produced):
                os.remove(produced)

    def report(self):
        counts = {}
        for entry in self.targets.values():
            counts[entry["status"]] = counts.get(entry["status"], 0) + 1
        site = sum(counts.get(name, 0) for name in ("archived", "placeholder", "missing"))
        print("archive pages: %d" % len(self.files))
        print("targets seen:  %d" % len(self.targets))
        for name in ("archived", "placeholder", "external", "missing"):
            print("  %-12s %d" % (name + ":", counts.get(name, 0)))
        missing = sorted(
            (entry["path"], entry)
            for entry in self.targets.values()
            if entry["status"] == "missing"
        )
        for path, entry in missing:
            print(
                "missing: %s (count %d, sources: %s)"
                % (path, entry["count"], ", ".join(entry["sources"]))
            )
        if not missing:
            print("missing: none")
        for line in self.log:
            print(line)
        if not self.log:
            print("fetched: none")
        print("covered %d of %d" % (site - counts.get("missing", 0), site))
        return self


def main(argv):
    parser = argparse.ArgumentParser(
        prog="closure",
        description="Prove link coverage for an archived site, one repository per run.",
    )
    parser.add_argument("--archive", required=True, help="the full-DOM archive directory")
    parser.add_argument("--manifest", required=True, help="that repository's crawl manifest index.json")
    parser.add_argument("--site", required=True, help="the site host, for example docs.example.com")
    parser.add_argument(
        "--out",
        default=None,
        help="where Links.json is written (default: beside the archive directory)",
    )
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="fetch missing targets through read_url and re-classify",
    )
    parser.add_argument(
        "--read-url",
        default=DEFAULT_READ_URL,
        help="the crawl4ai read_url.py wrapper (default: resolved beside this skill)",
    )
    parser.add_argument("--staging", default=None, help="where fetched markdown is staged")
    parser.add_argument(
        "--prefix",
        default=DEFAULT_PREFIX,
        help="archive filename prefix for closure additions",
    )
    parser.add_argument("--max-rounds", type=int, default=DEFAULT_MAX_ROUNDS)
    parser.add_argument("--max-fetch", type=int, default=DEFAULT_MAX_FETCH)
    args = parser.parse_args(argv)
    out = args.out or os.path.join(
        os.path.dirname(os.path.abspath(args.archive)), "Links.json"
    )
    links = Links(
        args.archive,
        args.manifest,
        args.site,
        read_url=args.read_url,
        staging=args.staging,
        prefix=args.prefix,
        max_rounds=args.max_rounds,
        max_fetch=args.max_fetch,
    ).collect().classify()
    if args.fetch:
        links.fetch()
    links.write(out).report()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
