"""Generate a Reference shelf's index from its archive.

    index.py <reference-dir> [--statuses PATH]

Walks `Archive/HTML/`, `Archive/Documents/` and `Raw/`, applies the status
table (a JSON file mapping every source URL to its slug, role and, for
failures, exit code, message, disposition and substitute), and writes:

    README.md             one row per source: title, link, raw file, status
    Archive/manifest.json the same rows as data, plus audit quality counts
    fetch-errors.log      every failed source with its disposition

The status vocabulary is finer than the fetch result: `converted`, `stub`
(a converted body under 1 KiB, with its explanation), `bot-walled`,
`timeout`, `unsupported`, `unconverted`, `orphaned`. Titles come from the
archived DOM's `<title>` - the persisted form of the crawl envelope's title
field - and fall back to the converted file's first H1, never to link text
or badge alt text. Archive files and converted files no status table claims
are reported as unindexed, so nothing on disk can vanish from the index.

No regex anywhere: BeautifulSoup reads each archived DOM's `<title>`, json
and string scans handle the rest.
"""

import argparse
import json
import os
import sys
from datetime import date

from bs4 import BeautifulSoup

from audit_markdown import Audit

STUB_BYTES = 1024
TITLE_LIMIT = 72
SOURCE_LINKS_MARKER = "<!--\n## Source links"
AUDIT_CHAIN = (
    "headings",
    "fences",
    "tables",
    "raw_html",
    "invisible",
    "lexical",
    "glued_code",
    "field_lists",
    "link_runs",
)
FAILURE_STATUSES = {"bot-walled", "timeout", "unsupported", "unavailable"}
UNCONVERTED = "unconverted"
ORPHANED = "orphaned"
MISSING = "missing"


def body_bytes(text):
    """The converted body's byte size, Source links comment excluded."""
    marker = text.find(SOURCE_LINKS_MARKER)
    body = text[:marker] if marker >= 0 else text
    return len(body.encode("utf-8"))


def first_h1(text):
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def dom_title(path):
    """The archived DOM's <title>, the crawl envelope's persisted title."""
    try:
        with open(path, encoding="utf-8", errors="replace") as handle:
            soup = BeautifulSoup(handle.read(), "html.parser")
    except OSError:
        return ""
    title = soup.title
    if title is None:
        return ""
    return " ".join(title.get_text().split())


def truncate_title(text, limit=TITLE_LIMIT):
    """Cut at a word boundary, never mid-word: badge alt text is not a title."""
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + " ..."


def title_of(entry, converted_path, archive_path, slug):
    """Status table override, then the DOM title, then the first H1, then the slug."""
    title = entry.get("title") or ""
    if not title and archive_path:
        title = dom_title(archive_path)
    if not title and converted_path:
        with open(converted_path, encoding="utf-8", errors="replace") as handle:
            title = first_h1(handle.read())
    return truncate_title(" ".join((title or slug).split()))


def quality_of(path):
    """The Markdown auditor's defect counts for one converted file.

    The Source links comment is stripped first: it is the index's own
    provenance record, not a defect in the converted body.
    """
    try:
        with open(path, encoding="utf-8", errors="replace") as handle:
            text = handle.read()
    except OSError:
        return {}
    marker = text.find(SOURCE_LINKS_MARKER)
    if marker >= 0:
        text = text[:marker]
    audit = Audit(text)
    for stage in AUDIT_CHAIN:
        getattr(audit, stage)()
    return audit.report()["counts"]


class Shelf:
    """One Reference directory with its archive, converted files and table."""

    def __init__(self, directory, statuses_path):
        self.directory = directory
        self.html_dir = os.path.join(directory, "Archive", "HTML")
        self.documents_dir = os.path.join(directory, "Archive", "Documents")
        self.raw_dir = os.path.join(directory, "Raw")
        self.entries = read_statuses(statuses_path)
        self.html_archives = {}
        self.document_archives = {}
        self.rows = []

    def scan(self):
        """Index every archive file by the slug it serves."""
        if os.path.isdir(self.html_dir):
            for name in sorted(os.listdir(self.html_dir)):
                if name.endswith(".content.html"):
                    continue
                if name.endswith(".html"):
                    self.html_archives[name[: -len(".html")]] = name
        if os.path.isdir(self.documents_dir):
            for name in sorted(os.listdir(self.documents_dir)):
                base, suffix = os.path.splitext(name)
                if suffix:
                    self.document_archives[base] = name
        return self

    def document_archive_for(self, slug):
        """The document whose archive base matches the converted slug.

        A document's Raw slug often appends the format
        (`generative-shapealgorithms` -> `generative-shapealgorithms-pdf`),
        so the exact base wins, then base plus format, then a base the slug
        starts with.
        """
        if slug in self.document_archives:
            return self.document_archives[slug]
        for base, name in sorted(self.document_archives.items()):
            extension = os.path.splitext(name)[1].lstrip(".")
            if slug == base + "-" + extension:
                return name
        for base, name in sorted(self.document_archives.items()):
            if slug.startswith(base):
                return name
        return None

    def build(self):
        claimed_raw = set()
        claimed_archives = set()
        for entry in self.entries:
            row = self.row_for(entry)
            self.rows.append(row)
            if row["raw_slug"]:
                claimed_raw.add(row["raw_slug"] + ".md")
            for key in ("archive", "content"):
                if row[key]:
                    claimed_archives.add(os.path.basename(row[key]))
        self.rows.extend(self.orphan_rows(claimed_raw, claimed_archives))
        return self

    def row_for(self, entry):
        source = entry.get("source", "")
        slug = entry.get("slug", "")
        html_name = self.html_archives.get(slug)
        document_name = self.document_archive_for(slug) if slug else None
        converted_name = slug + ".md" if slug and os.path.exists(
            os.path.join(self.raw_dir, slug + ".md")
        ) else None
        row = {
            "source": source,
            "role": entry.get("role") or "sources",
            "slug": slug,
            "archive": "",
            "content": "",
            "converted": "",
            "raw_slug": slug if converted_name else "",
            "status": "",
            "title": "",
            "quality": {},
            "disposition": entry.get("disposition", ""),
            "substitute": entry.get("substitute", ""),
            "note": entry.get("note", ""),
            "exit": entry.get("exit"),
            "message": entry.get("message", ""),
        }
        if html_name:
            row["archive"] = "Archive/HTML/" + html_name
            content = html_name[: -len(".html")] + ".content.html"
            if os.path.exists(os.path.join(self.html_dir, content)):
                row["content"] = "Archive/HTML/" + content
        elif document_name:
            row["archive"] = "Archive/Documents/" + document_name
        if converted_name:
            row["converted"] = "Raw/" + converted_name
        path = os.path.join(self.directory, row["archive"]) if row["archive"] else ""
        row["title"] = title_of(
            entry,
            os.path.join(self.raw_dir, converted_name) if converted_name else "",
            path,
            slug,
        )
        row["status"] = self.status_for(entry, row, converted_name)
        if converted_name and row["status"] in ("converted", "stub"):
            row["quality"] = quality_of(os.path.join(self.raw_dir, converted_name))
        if html_name is not None:
            self.html_archives.pop(html_name, None)
        if document_name is not None:
            self.document_archives.pop(os.path.splitext(document_name)[0], None)
        return row

    def status_for(self, entry, row, converted_name):
        """The finer vocabulary: the fetch's word, else what the disk shows."""
        declared = entry.get("status", "")
        if declared:
            return declared
        if not row["archive"]:
            return MISSING if not converted_name else ORPHANED
        if not converted_name:
            return UNCONVERTED
        with open(os.path.join(self.raw_dir, converted_name), encoding="utf-8") as handle:
            size = body_bytes(handle.read())
        if size < STUB_BYTES:
            row["note"] = row["note"] or (
                "converted body is %d bytes, under the 1 KiB stub threshold" % size
            )
            return "stub"
        return "converted"

    def orphan_rows(self, claimed_raw, claimed_archives):
        """Rows for converted files no status-table entry claims."""
        rows = []
        if os.path.isdir(self.raw_dir):
            for name in sorted(os.listdir(self.raw_dir)):
                if name in claimed_raw or not name.endswith(".md"):
                    continue
                slug = name[: -len(".md")]
                row = {
                    "source": "",
                    "role": "unindexed",
                    "slug": slug,
                    "archive": "",
                    "content": "",
                    "converted": "Raw/" + name,
                    "raw_slug": slug,
                    "status": ORPHANED,
                    "title": truncate_title(first_h1_file(self.raw_dir, name)),
                    "quality": quality_of(os.path.join(self.raw_dir, name)),
                    "disposition": "",
                    "substitute": "",
                    "note": "no status-table entry claims this converted file",
                    "exit": None,
                    "message": "",
                }
                rows.append(row)
        if claimed_archives:
            leftover = [
                name
                for name in list(self.html_archives.values())
                + list(self.document_archives.values())
                if name not in claimed_archives
            ]
            if leftover:
                sys.stderr.write(
                    "index: unclaimed archive files: %s\n" % ", ".join(leftover)
                )
        return rows

    def counts(self):
        histogram = {}
        for row in self.rows:
            histogram[row["status"]] = histogram.get(row["status"], 0) + 1
        return histogram

    def readme(self):
        """The index: one section per role, one row per source."""
        lines = [
            "# Reference index",
            "",
            "Generated by `<source-pipeline>/scripts/index.py` on %s from"
            % date.today().isoformat(),
            "`Archive/` and `Raw/`; regenerate with the status table, never by hand.",
            "",
            "Statuses: `converted`, `stub` (under 1 KiB, with its explanation),",
            "`bot-walled`, `timeout`, `unsupported`, `unavailable`; failures carry a",
            "disposition in `fetch-errors.log`.",
            "",
        ]
        roles = []
        for row in self.rows:
            if row["role"] not in roles:
                roles.append(row["role"])
        for role in roles:
            lines.append("## " + role.replace("-", " ").capitalize())
            lines.append("")
            lines.append("| Source | Link | Raw file | Status |")
            lines.append("| --- | --- | --- | --- |")
            for row in self.rows:
                if row["role"] != role:
                    continue
                link = row["source"] or row["slug"]
                raw = "`%s`" % row["converted"] if row["converted"] else "-"
                lines.append(
                    "| %s | %s | %s | %s |"
                    % (table_cell(row["title"]), table_cell(link), raw, status_cell(row))
                )
            lines.append("")
        histogram = self.counts()
        lines.extend(
            [
                "## Counts (%s)" % date.today().isoformat(),
                "",
                "%d sources: " % len(self.rows)
                + ", ".join("%s %d" % item for item in sorted(histogram.items()))
                + ".",
                "",
            ]
        )
        return "\n".join(lines)

    def manifest(self):
        sources = []
        for row in self.rows:
            entry = {
                "source": row["source"],
                "kind": "Document" if row["archive"].startswith("Archive/Documents") else "HTML",
                "archive": row["archive"],
                "content": row["content"],
                "converted": row["converted"],
                "status": row["status"],
                "title": row["title"],
            }
            if row["quality"]:
                entry["quality"] = row["quality"]
            for key in ("disposition", "substitute", "note", "exit", "message"):
                if row.get(key) not in ("", None):
                    entry[key] = row[key]
            sources.append(entry)
        return {"sources": sources}

    def log(self):
        """fetch-errors.log, regenerated from the status table.

        Every entry is complete and self-prefixed, so no message is ever
        truncated the way the hand-written log's first line was.
        """
        lines = ["# Fetch errors - regenerated by index.py from the status table", ""]
        failures = [row for row in self.rows if row["status"] in FAILURE_STATUSES]
        for row in failures:
            lines.append("URL: %s" % (row["source"] or row["slug"]))
            lines.append("Exit code: %s" % (row["exit"] if row["exit"] is not None else "-"))
            lines.append(
                "Disposition: %s" % (row["disposition"] or "unavailable")
            )
            if row["substitute"]:
                lines.append("Substitute: %s" % row["substitute"])
            if row["note"]:
                lines.append("Note: %s" % row["note"])
            message = row["message"] or "%s source: no recorded message" % row["status"]
            if not message.startswith("read_url:"):
                message = "read_url: " + message
            lines.append("Message: %s" % message)
            lines.append("")
        return "\n".join(lines), len(failures)


def first_h1_file(directory, name):
    with open(os.path.join(directory, name), encoding="utf-8", errors="replace") as handle:
        return first_h1(handle.read())


def table_cell(text):
    """One Markdown table cell: pipes cannot survive unescaped."""
    return str(text).replace("|", "\\|")


def status_cell(row):
    """The README's status cell: the vocabulary plus the stub explanation."""
    cell = row["status"]
    if row["status"] == "stub" and row["note"]:
        cell += " - " + row["note"]
    elif row["status"] in FAILURE_STATUSES and row["substitute"]:
        cell += " - substitute fetched: %s" % row["substitute"]
    elif row["status"] in FAILURE_STATUSES and row["disposition"]:
        cell += " - %s" % row["disposition"]
    return cell


def read_statuses(path):
    if not path or not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload, list):
        return payload
    return payload.get("sources") or []


def main(argv):
    parser = argparse.ArgumentParser(
        prog="index",
        description="Generate a Reference shelf's README, manifest and error log "
        "from its archive plus a status table.",
    )
    parser.add_argument("directory", help="the Reference directory to index")
    parser.add_argument(
        "--statuses",
        default=None,
        help="status table as JSON (default: <directory>/statuses.json when present)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print the counts and histogram without writing any file",
    )
    args = parser.parse_args(argv)
    statuses_path = args.statuses or os.path.join(args.directory, "statuses.json")
    shelf = Shelf(args.directory, statuses_path).scan().build()
    histogram = shelf.counts()
    print(
        "sources: %d | %s"
        % (
            len(shelf.rows),
            " | ".join("%s: %d" % item for item in sorted(histogram.items())),
        )
    )
    if args.dry_run:
        return 0
    readme_path = os.path.join(args.directory, "README.md")
    manifest_path = os.path.join(args.directory, "Archive", "manifest.json")
    log_path = os.path.join(args.directory, "fetch-errors.log")
    with open(readme_path, "w", encoding="utf-8") as handle:
        handle.write(shelf.readme())
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(shelf.manifest(), handle, indent=2)
        handle.write("\n")
    log_text, failures = shelf.log()
    with open(log_path, "w", encoding="utf-8") as handle:
        handle.write(log_text)
    print("README: %s (%d rows)" % (readme_path, len(shelf.rows)))
    print("manifest: %s (%d entries)" % (manifest_path, len(shelf.manifest()["sources"])))
    print("log: %s (%d failures)" % (log_path, failures))
    orphans = [row["slug"] for row in shelf.rows if row["role"] == "unindexed"]
    print("unindexed: %s" % (", ".join(orphans) or "none"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
