"""Convert an archived HTML page to Markdown.

Pipeline: clean the DOM, run pandoc, then normalise the Markdown - unwrap
heading self-links, drop table-of-contents runs and empty comments, flatten a
collapsed run of consecutive links or images into one list item per line
(anchor-only navigation is dropped instead), localize same-site links to
relative files - and append a Source links appendix as the provenance record.

    html_to_md.py <input.html> <output.md> [--links appendix|none] [--shelf DIR]

Cleaning is required: pandoc passes <figure>/<div> wrappers through as raw
HTML, which pollutes the Markdown with markup and loses every code fence.

The conversion reports its own quality. The printed line carries a status -
`converted`, or `stub` when the converted body is under 1 KiB, which the
skill's decision table requires to be explained in the index - and a second
line names the defect classes the Markdown auditor found in the produced
body (raw HTML that survived, heading jumps, table damage).

`--shelf DIR` is the directory holding the converted files. When given, a
same-site link is rewritten only if its target exists there; otherwise the
link is reduced to its text (body) or recorded as a code span (appendix), so a
converted file never carries a link that cannot resolve. Links to template
placeholders such as /api/.../{section_id}/... are exactly this case.

The HTML is parsed with BeautifulSoup and the Markdown is walked with string
scans - no regular expressions anywhere in this file.
"""

import os
import subprocess
import sys

from clean_html import Document

BLOCK_NAMES = {"h1", "h2", "h3", "h4", "h5", "h6"}
BOILERPLATE = {"on this page", "copy anchor link"}
STUB_BYTES = 1024
SHELF = None


def audit_summary(text):
    """One line naming the defect classes in the converted body, or 'clean'.

    The audit runs on the body before the Source links appendix, so the
    provenance comment is never counted as a defect. The classes are the
    auditor's own: raw HTML that survived, heading jumps, table damage, and
    the structural-loss canaries (glued code spans, flattened signatures,
    collapsed link runs). A missing dependency is reported, not silently
    skipped.
    """
    try:
        from audit_markdown import Audit
    except ImportError as error:
        return "unavailable (%s)" % error
    counts = (
        Audit(text)
        .headings()
        .fences()
        .tables()
        .raw_html()
        .glued_code()
        .field_lists()
        .link_runs()
        .invisible()
        .lexical()
        .report()["counts"]
    )
    if not counts:
        return "clean"
    return ", ".join("%s %d" % (name, count) for name, count in sorted(counts.items()))


def load_shelf(directory):
    """The set of converted names a link may point at.

    Accepts either a directory of converted `.md` files or the archive
    directory of `<NNN>-<slug>.content.html` files. The archive is the correct
    source when converting in a loop: it is complete before the first
    conversion, whereas the Raw directory fills as the loop runs, so a link to
    a page not yet written would be judged missing and stripped.
    """
    names = set()
    for name in os.listdir(directory):
        if name.endswith(".content.html"):
            base = name[: -len(".content.html")]
            if len(base) > 4 and base[:3].isdigit() and base[3] == "-":
                base = base[4:]
            names.add(base + ".md")
        elif name.endswith(".md"):
            names.add(name)
    return names


def local_target(href):
    """Map a same-site path onto the converted file beside this one.

    `./` is required: a root-absolute `/cli/x` link resolves against the
    filesystem root once the Markdown lives on disk, so it would break.
    """
    if not href.startswith("/") or href.startswith("//"):
        return None
    base, _, anchor = href.partition("#")
    path = base.strip("/")
    name = (path.replace("/", "-") if path else "index") + ".md"
    if SHELF is not None and name not in SHELF:
        return None
    return "./" + name + ("#" + anchor if anchor else "")


def heading_parts(line):
    """Split '# Title' into (hashes, title), or (None, line) when not a heading."""
    body = line.lstrip("#")
    if body == line or not body.startswith(" "):
        return None, line
    return line[: len(line) - len(body)], body.strip()


def unwrap_heading_link(line):
    """'## [Title](#x)' -> ('## Title', True); anything else is returned as is."""
    hashes, title = heading_parts(line)
    if hashes is None:
        return line, False
    if not (title.startswith("[") and title.endswith(")")):
        return line, False
    split = title.find("](")
    if split < 0 or not title[split + 2 : -1].startswith("#"):
        return line, False
    return hashes + " " + title[1:split], True


def is_boilerplate_heading(line):
    hashes, title = heading_parts(line)
    return hashes is not None and title.lower() in BOILERPLATE


def is_toc_run(line):
    """True when the line is nothing but [text](#anchor) segments."""
    text = line.strip()
    index = 0
    count = 0
    while index < len(text):
        if text[index] != "[":
            return False
        close = text.find("](", index)
        if close < 0:
            return False
        end = text.find(")", close)
        if end < 0 or not text[close + 2 : end].startswith("#"):
            return False
        index = end + 1
        count += 1
    return count > 0


def is_empty_comment(line):
    text = line.strip()
    return text.startswith("<!--") and text.endswith("-->")


def link_tokens(line):
    """The (start, end) extents of each [text](url) or ![alt](url) token.

    Bracket nesting is counted, so an image inside a link text stays one
    token, and the destination ends at the first closing paren, which
    pandoc's percent-escaped destinations make safe.
    """
    tokens = []
    index = 0
    length = len(line)
    while index < length:
        if line[index] == "!":
            if index + 1 >= length or line[index + 1] != "[":
                index += 1
                continue
            start = index
            index += 2
        elif line[index] == "[":
            start = index
            index += 1
        else:
            index += 1
            continue
        depth = 1
        close = -1
        while index < length:
            character = line[index]
            if character == "\\":
                index += 2
                continue
            if character == "[":
                depth += 1
            elif character == "]":
                depth -= 1
                if depth == 0:
                    close = index
                    break
            index += 1
        if close < 0:
            break
        if close + 1 >= length or line[close + 1] != "(":
            index = close + 1
            continue
        end = line.find(")", close + 2)
        if end < 0:
            break
        tokens.append((start, end + 1))
        index = end + 1
    return tokens


def token_target(line, token):
    """The destination of one link or image token - the outermost one."""
    opened = line.rfind("](", token[0], token[1])
    if opened < 0:
        return ""
    return line[opened + 2 : token[1] - 1]


def reshape_link_run(line):
    """Flatten a collapsed run of links or images into one list item per line.

    A line that is nothing but consecutive link or image tokens - only
    whitespace between and around them - is a container the unwrap
    flattened (the structural-loss class the auditor reports as link-run).
    A run whose every destination is an in-page anchor is pure navigation
    and is dropped; any other run of more than three tokens becomes a list,
    one token per item, keeping the original indent. Everything else is
    returned untouched, so prose and ordinary short link pairs stay as
    pandoc wrote them.
    """
    tokens = link_tokens(line)
    if len(tokens) < 2:
        return [line], "keep"
    if line[: tokens[0][0]].strip() or line[tokens[-1][1] :].strip():
        return [line], "keep"
    for index in range(1, len(tokens)):
        if line[tokens[index - 1][1] : tokens[index][0]].strip():
            return [line], "keep"
    targets = [token_target(line, token) for token in tokens]
    if all(target.startswith("#") for target in targets):
        return [], "drop"
    if len(tokens) <= 3:
        return [line], "keep"
    prefix = line[: tokens[0][0]]
    return [prefix + "- " + line[start:end] for start, end in tokens], "split"


METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS")


def separate_method(line):
    """'POST/v1/x' -> 'POST /v1/x'.

    The method and the path are separate chips on the page with no whitespace
    between them, and punctuation stays attached under the word-boundary rule,
    so the method/path join is repaired here.
    """
    for method in METHODS:
        if line.startswith(method + "/"):
            return method + " " + line[len(method) :]
    return line


def localize(markdown):
    """Rewrite same-site links to local files; unlink the ones that cannot resolve."""
    pieces = []
    index = 0
    while index < len(markdown):
        opened = markdown.find("](", index)
        if opened < 0:
            pieces.append(markdown[index:])
            break
        closed = markdown.find(")", opened + 2)
        if closed < 0:
            pieces.append(markdown[index:])
            break
        href = markdown[opened + 2 : closed]
        bracket = markdown.rfind("[", index, opened)
        if bracket < 0 or not href.startswith("/") or href.startswith("//"):
            pieces.append(markdown[index : closed + 1])
            index = closed + 1
            continue
        text = markdown[bracket + 1 : opened]
        target = local_target(href)
        pieces.append(markdown[index:bracket])
        pieces.append(f"[{text}]({target})" if target else text)
        index = closed + 1
    return "".join(pieces)


def choose_source(path, prefer):
    """Pick the conversion input.

    The full DOM is preferred: the content filter drops elements it scores as
    non-content, and a heading whose only child is an anchor plus a "Copy
    Anchor Link" button loses its title entirely, leaving the section's body
    behind with no heading. The cleaner already removes nav, footer, script and
    style, so the full DOM leaks no boilerplate.
    """
    if prefer == "full" and path.endswith(".content.html"):
        sibling = path[: -len(".content.html")] + ".html"
        if os.path.exists(sibling):
            return sibling
    return path


def appendix(links, mode):
    """Provenance record: every original href, linked when a local target exists.

    In comment mode the block is an HTML comment: present in the file, invisible
    in a browser or on GitHub, so referential data does not pollute the rendered
    document.
    """
    lines = ["## Source links", ""]
    for text, href in links:
        target = local_target(href)
        if target:
            lines.append(f"- [{text}]({target}) - source: {href}")
        elif href.startswith("/"):
            lines.append(f"- {text} - source: `{href}`")
        else:
            lines.append(f"- [{text}]({href})")
    body = "\n".join(lines)
    return f"<!--\n{body}\n-->" if mode == "comment" else body


def convert(source, target, links_mode, prefer="full"):
    html = open(choose_source(source, prefer), encoding="utf-8", errors="replace").read()
    document = Document(html)
    links = document.links() if links_mode != "none" else []

    result = subprocess.run(
        ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none", "--strip-comments", "-o", target],
        input=document.drop().drop_chrome().isolate().tabulate().expand_signatures().expand_definitions().separate_runs().rename_inline().unwrap().separate_inline().flatten().lift_links().strip_attributes().html().encode("utf-8"),
        capture_output=True,
    )
    if result.returncode != 0:
        sys.stderr.write(result.stderr.decode("utf-8", "replace"))
        return result.returncode

    kept = []
    unwrapped = 0
    dropped = 0
    reshaped = 0
    for line in open(target, encoding="utf-8").read().splitlines():
        if is_toc_run(line) or is_empty_comment(line) or is_boilerplate_heading(line):
            dropped += 1
            continue
        lines, action = reshape_link_run(line)
        if action == "drop":
            dropped += 1
            continue
        if action == "split":
            reshaped += 1
            kept.extend(lines)
            continue
        line, changed = unwrap_heading_link(line)
        unwrapped += 1 if changed else 0
        kept.append(separate_method(line))

    body = localize("\n".join(kept).rstrip())
    status = "stub" if len(body) < STUB_BYTES else "converted"
    audit_line = audit_summary(body)
    if links:
        body += "\n\n" + appendix(links, links_mode)
    body += "\n"
    open(target, "w", encoding="utf-8").write(body)

    raw = sum(1 for line in body.splitlines() if line.startswith("<"))
    print(
        f"html_to_md: {len(html)} html chars -> {len(body)} md chars, "
        f"{unwrapped} heading links unwrapped, {dropped} lines dropped, "
        f"{reshaped} link runs reshaped, "
        f"{len(links)} links appended, {raw} raw-html lines, "
        f"status: {status} ({len(body)} bytes), {target}"
    )
    print("html_to_md: audit: " + audit_line)
    return 0


def main(argv):
    global SHELF
    args = argv[1:]
    positional = []
    links_mode = "comment"
    prefer = "full"
    index = 0
    while index < len(args):
        arg = args[index]
        if arg == "--links":
            links_mode = args[index + 1] if index + 1 < len(args) else "comment"
            if links_mode not in {"comment", "appendix", "none"}:
                sys.stderr.write("--links takes comment, appendix or none\n")
                return 2
            index += 2
        elif arg == "--prefer":
            prefer = args[index + 1] if index + 1 < len(args) else "full"
            if prefer not in {"full", "filtered"}:
                sys.stderr.write("--prefer takes full or filtered\n")
                return 2
            index += 2
        elif arg == "--shelf":
            shelf = args[index + 1] if index + 1 < len(args) else ""
            if not os.path.isdir(shelf):
                sys.stderr.write(f"--shelf is not a directory: {shelf}\n")
                return 2
            SHELF = load_shelf(shelf)
            index += 2
        else:
            positional.append(arg)
            index += 1
    if len(positional) != 2:
        sys.stderr.write(
            "usage: html_to_md.py <input.html> <output.md> "
            "[--links comment|appendix|none] [--prefer full|filtered] [--shelf DIR]\n"
        )
        return 2
    return convert(positional[0], positional[1], links_mode, prefer)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
