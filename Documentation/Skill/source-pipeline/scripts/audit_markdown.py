"""Audit Markdown through a parsed tree and character scans - never a regex.

    Audit(text).headings().fences().tables().raw_html().glued_code().field_lists().link_runs().invisible().lexical().report()

Structure is answered by the mistune AST, walked with the same depth-first fold
the HTML cleaner uses. Table cell counts, invisible characters, long lines and
fence padding are source-text properties that a parser normalises away, so they
are answered by scanning characters - not by matching patterns. A regex cannot
tell an escaped pipe from a delimiter; a scanner can. The structural-loss
canaries are the same kind of scan: a code span glued to a word (`glued-code`,
a collapsed parameter card), a signature flattened into a code span plus a
bare argument list (`field-list-collapse`, a dl-style signature), and a line
that is nothing but consecutive links or images (`link-run`, a flattened
table of contents or badge strip). Each fires on the line it appears on, so a
regression in the converter produces a class instead of passing silently.
"""

from mistune import create_markdown

PARSE = create_markdown(renderer="ast", plugins=["table", "strikethrough", "task_lists"])
INVISIBLE = {
    0x200B: "zwsp",
    0x200C: "zwnj",
    0x200D: "zwj",
    0xFEFF: "bom",
    0x00AD: "shy",
    0x2060: "wj",
}
LONG_LINE = 1000


def fold(nodes, visit, seed=None):
    """Depth-first map-reduce over AST nodes: visit(node, acc) -> acc."""
    for node in nodes:
        seed = visit(node, seed)
        seed = fold(node.get("children") or [], visit, seed)
    return seed


def text_of(node):
    """Concatenate the text leaves beneath a node."""
    found = []

    def visit(current, acc):
        if current["type"] == "text" and current.get("raw"):
            acc.append(current["raw"])
        return acc

    fold([node], visit, found)
    return "".join(found)


def split_cells(line):
    """Split one table row on unescaped pipes, dropping the outer delimiters."""
    cells = []
    current = []
    escaped = False
    for character in line.strip():
        if escaped:
            current.append(character)
            escaped = False
        elif character == "\\":
            escaped = True
        elif character == "|":
            cells.append("".join(current))
            current = []
        else:
            current.append(character)
    cells.append("".join(current))
    if cells and not cells[0].strip():
        cells = cells[1:]
    if cells and not cells[-1].strip():
        cells = cells[:-1]
    return cells


def is_delimiter(line):
    """A table's second row: dashes and colons only, at least three dashes."""
    text = line.strip()
    if "-" not in text:
        return False
    dashes = 0
    for character in text:
        if character == "-":
            dashes += 1
        elif character not in "|: \t":
            return False
    return dashes >= 3


def code_spans(line):
    """The (start, end) extents of each code span in one line, backticks included.

    A span opens at a run of backticks and closes at the next run of the same
    length, so a longer or shorter run inside is literal content; a
    backslash-escaped backtick is never a delimiter. An unclosed opening run
    starts no span. Returning whole extents lets a scanner ask what follows
    a span without re-finding it.
    """
    spans = []
    index = 0
    length = len(line)
    while index < length:
        if line[index] == "\\" and index + 1 < length and line[index + 1] == "`":
            index += 2
            continue
        if line[index] != "`":
            index += 1
            continue
        opening = 0
        while index + opening < length and line[index + opening] == "`":
            opening += 1
        cursor = index + opening
        close = -1
        while cursor < length:
            if line[cursor] == "\\" and cursor + 1 < length and line[cursor + 1] == "`":
                cursor += 2
                continue
            if line[cursor] != "`":
                cursor += 1
                continue
            closing = 0
            while cursor + closing < length and line[cursor + closing] == "`":
                closing += 1
            if closing == opening:
                close = cursor
                cursor += closing
                break
            cursor += closing
        if close < 0:
            break
        spans.append((index, cursor))
        index = cursor
    return spans


def link_tokens(line):
    """The (start, end) extents of each [text](url) or ![alt](url) token.

    Bracket nesting is counted, so an image inside a link text stays one
    token, and the destination ends at the first closing paren, which
    pandoc's percent-escaped destinations make safe. Code spans are skipped
    whole: a link shape inside inline code is an example, not a link.
    """
    spans = code_spans(line)
    tokens = []
    index = 0
    length = len(line)
    while index < length:
        masked = False
        for start, end in spans:
            if start <= index < end:
                index = end
                masked = True
                break
        if masked:
            continue
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


def is_pure_run(line, tokens):
    """True when the line is nothing but consecutive tokens - whitespace gaps only."""
    if not tokens:
        return False
    if line[: tokens[0][0]].strip() or line[tokens[-1][1] :].strip():
        return False
    for index in range(1, len(tokens)):
        if line[tokens[index - 1][1] : tokens[index][0]].strip():
            return False
    return True


class Audit:
    """Chainable Markdown audit; every stage returns self."""

    def __init__(self, text, long_line=LONG_LINE):
        self.text = text
        self.lines = text.splitlines()
        self.nodes = PARSE(text)
        self.long_line = long_line
        self.findings = []

    def _add(self, kind, line=None, detail=""):
        self.findings.append({"kind": kind, "line": line, "detail": detail})
        return self

    def _stage(self, visit):
        fold(self.nodes, visit, self)
        return self

    def headings(self):
        levels = []

        def visit(node, acc):
            if node["type"] != "heading":
                return acc
            level = (node.get("attrs") or {}).get("level", 0)
            levels.append(level)
            title = text_of(node).strip()
            children = node.get("children") or []
            linked = [
                child
                for child in children
                if child["type"] == "link"
                and "#" in str((child.get("attrs") or {}).get("url", ""))
            ]
            # A heading self-link may be written `#anchor` or as an absolute URL
            # carrying the fragment (`https://host/page#anchor`). Both are the
            # same defect: the heading text wrapped in a link to itself.
            if linked and text_of(linked[0]).strip() == title:
                self._add("heading-anchor", detail=f"level {level}: {title[:60]}")
            if title:
                acc._titles.append(title)
            return acc

        self._titles = []
        self._stage(visit)
        duplicates = {title for title in self._titles if self._titles.count(title) > 1}
        for title in sorted(duplicates):
            self._add("heading-duplicate", detail=title[:60])
        if levels:
            if levels.count(1) == 0:
                self._add("heading-no-h1")
            if levels.count(1) > 1:
                self._add("heading-multi-h1", detail=str(levels.count(1)))
            previous = levels[0]
            for level in levels[1:]:
                if level > previous + 1:
                    self._add("heading-jump", detail=f"{previous} -> {level}")
                previous = level
        return self

    def fences(self):
        open_fence = None
        bare = 0
        padded = 0

        def visit(node, acc):
            nonlocal bare
            if node["type"] == "block_code" and not (node.get("attrs") or {}).get("info"):
                bare += 1
            return acc

        self._stage(visit)
        if bare:
            self._add("fence-no-language", detail=str(bare))

        for number, line in enumerate(self.lines, start=1):
            stripped = line.strip()
            if not stripped.startswith("```"):
                if open_fence is not None and not stripped:
                    padded += 1
                continue
            if open_fence is None:
                open_fence = number
            else:
                open_fence = None
        if padded:
            self._add("fence-blank-padded", detail=str(padded))
        if open_fence is not None:
            self._add("fence-unclosed", line=open_fence)
        return self

    def tables(self):
        block = []
        for number, line in enumerate(self.lines + [""], start=1):
            if line.lstrip().startswith("|"):
                block.append((number, line))
                continue
            if len(block) >= 2 and is_delimiter(block[1][1]):
                header = len(split_cells(block[0][1]))
                for row_number, row in block[2:]:
                    cells = split_cells(row)
                    if len(cells) != header:
                        self._add(
                            "table-row-mismatch",
                            line=row_number,
                            detail=f"{len(cells)} cells, header has {header}",
                        )
                for cell_number, row in block:
                    for cell in split_cells(row):
                        if "|" in cell:
                            self._add("table-escaped-pipe", line=cell_number, detail=cell.strip()[:40])
                            break
            block = []
        return self

    def raw_html(self):
        def visit(node, acc):
            if node["type"] in {"block_html", "inline_html"}:
                self._add("raw-html", detail=str((node.get("raw") or "")[:40]))
            return acc

        return self._stage(visit)

    def glued_code(self):
        """Flag a code span immediately followed by a word - a collapsed card.

        The signature of a parameter or property card that lost its row
        structure: `` `status?`string `` - the closing backtick runs straight
        into a word. One backslash escape is stepped over first, so
        `` `status?`\\|null `` is the same glue while a trailing line-break
        backslash is not; the word must be two characters or longer, so a
        plural like `` `<ellipse>`s `` is not.
        """
        in_fence = False
        for number, line in enumerate(self.lines, start=1):
            if line.strip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            for _, end in code_spans(line):
                cursor = end
                if cursor < len(line) and line[cursor] == "\\":
                    cursor += 2
                run = 0
                while cursor + run < len(line) and line[cursor + run].isalnum():
                    run += 1
                if run >= 2:
                    self._add(
                        "glued-code",
                        line=number,
                        detail=line[cursor : cursor + 24],
                    )
        return self

    def field_lists(self):
        """Flag a code span followed by a bare argument list - a collapsed signature.

        The signature of a dl-style signature list flattened into one line:
        `` `pymesh.``boolean`(*mesh_1*, ...) `` - the parenthesised argument
        list sits directly against the closing backtick with no separator at
        all, and its contents carry the comma or asterisk of a parameter
        list. Prose parentheses after a spaced code span do not match.
        """
        in_fence = False
        for number, line in enumerate(self.lines, start=1):
            if line.strip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            for _, end in code_spans(line):
                cursor = end
                if cursor >= len(line) or line[cursor] != "(":
                    continue
                close = line.find(")", cursor + 1)
                if close < 0:
                    continue
                argument = line[cursor + 1 : close]
                if argument.strip() and ("," in argument or "*" in argument):
                    self._add(
                        "field-list-collapse",
                        line=number,
                        detail=line[cursor : close + 1][:40],
                    )
        return self

    def link_runs(self):
        """Flag a line that is a run of more than three consecutive links or images.

        The signature of a table of contents or badge strip whose container
        was unwrapped: `` [A](#a)[B](#b)[C](#c)[D](#d) `` - the line is
        nothing but link or image tokens, with at most whitespace between
        and around them.
        """
        in_fence = False
        for number, line in enumerate(self.lines, start=1):
            if line.strip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            tokens = link_tokens(line)
            if len(tokens) > 3 and is_pure_run(line, tokens):
                self._add(
                    "link-run",
                    line=number,
                    detail=f"{len(tokens)} consecutive links or images",
                )
        return self

    def invisible(self):
        for number, line in enumerate(self.lines, start=1):
            for character in line:
                name = INVISIBLE.get(ord(character))
                if name:
                    self._add("invisible", line=number, detail=name)
                    break
        return self

    def lexical(self):
        in_fence = False
        for number, line in enumerate(self.lines, start=1):
            if line.strip().startswith("```"):
                in_fence = not in_fence
                continue
            if len(line) > self.long_line:
                self._add("long-line", line=number, detail=f"{len(line)} chars")
            if in_fence:
                for character in line:
                    if ord(character) > 127:
                        self._add("code-non-ascii", line=number, detail=repr(character))
                        break
        return self

    def report(self):
        counts = {}
        for finding in self.findings:
            counts[finding["kind"]] = counts.get(finding["kind"], 0) + 1
        return {"findings": self.findings, "counts": counts}
