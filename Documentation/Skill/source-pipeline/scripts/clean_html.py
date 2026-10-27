"""Clean a rendered DOM before pandoc.

A fluent API over a recursive map-reduce of the parse tree:

    Document(html).drop().drop_chrome().isolate().tabulate().expand_signatures()
        .expand_definitions().separate_runs().rename_inline().unwrap()
        .separate_inline().flatten().lift_links().strip_attributes().html()

Every stage is a fold over BeautifulSoup elements - never a regex over markup.
A regex breaks on nesting, quoting and attributes, which is how a cleaner
silently starts deleting content it was meant to keep.
"""

from bs4 import BeautifulSoup, NavigableString

DROP = ("script", "style", "template", "svg", "button", "nav", "footer", "aside", "form", "colgroup", "col")
UNWRAP = ("figure", "div", "section", "article", "main", "header")
BLOCK = ("h1", "h2", "h3", "h4", "h5", "h6", "p")
INLINE = ("a", "span", "code", "strong", "em", "b", "i", "small", "kbd", "samp", "var", "mark", "sup", "sub")
KEEP = {"a": {"href"}, "code": {"class"}, "pre": {"class"}, "img": {"src", "alt"}}

# Site chrome that renders as text but is never content. This chrome is drawn
# outside the semantic tags the DROP list covers, so it is selected by id,
# class or custom tag. Every selector is site-specific and stable; a selector
# that matches nothing changes nothing.
CHROME = (
    # GitHub: the site header, flash messages, hovercards and error overlays.
    ".header-wrapper",
    "#js-flash-container",
    ".Popover",
    "#ajax-error-message",
    # Doxygen: the logo bar, navigation strip, search windows and breadcrumbs.
    "#titlearea",
    "#main-nav",
    "#MSearchSelectWindow",
    "#MSearchResultsWindow",
    "#nav-path",
    "hr.footer",
    "address.footer",
    # MDN: the banner and footer placements around the content.
    "mdn-placement-top",
    "mdn-placement-bottom",
    ".page-layout__banner",
    ".page-layout__footer",
)

# Content containers that carry the page when they match: a GitHub README, a
# doxygen page body, an MDN article. A container only wins when it holds at
# least half of the body's text, so on a page with a different structure the
# selector is inert and nothing outside the DROP list is removed.
REGIONS = ("article.markdown-body", "div#doc-content", "main#content")
REGION_SHARE = 0.5

# Inline elements the GFM writer cannot represent, so pandoc passes them
# through as raw HTML. `kbd` is keystroke styling; `code` keeps the same
# text as keyboard input, which every GFM renderer shows.
RENAME = {"kbd": "code"}

PROPERTY_CARD = "group/property"
SIGNATURE = {"function", "class", "method"}
AUTH_HEADING = "authorization"
INLINE_BLOCKS = ("p", "div", "ul", "ol", "li", "dl", "dt", "dd", "blockquote")
RUN_MINIMUM = 3


def fold(node, visit, seed=None):
    """Depth-first map-reduce over elements: visit(element, acc) -> acc."""
    acc = visit(node, seed)
    for child in list(node.children):
        if getattr(child, "name", None):
            acc = fold(child, visit, acc)
    return acc


def text_of(element, limit=100):
    return " ".join(element.get_text(" ", strip=True).split())[:limit]


def language_of(class_value):
    """Map a highlighting class onto a pandoc language class.

    pandoc maps `language-x` onto a fence language; pygments-style
    `sourceCode python xref py` is unrecognised, and an unrecognised class makes
    the reader fall back to raw HTML for the whole block.
    """
    tokens = str(class_value).split()
    for token in tokens:
        if token.startswith("language-"):
            return token
    if len(tokens) > 1 and tokens[0] in {"sourceCode", "highlight", "hljs", "chroma"}:
        return "language-" + tokens[1]
    return ""


class Document:
    """A parsed document with chainable cleaning stages."""

    def __init__(self, html):
        self.soup = BeautifulSoup(html, "html.parser")

    def _collect(self, names):
        found = []

        def visit(element, acc):
            if element.name in names:
                acc.append(element)
            return acc

        return fold(self.soup, visit, found)

    def drop(self, *names):
        """Remove whole elements: boilerplate that is never content.

        A `<button>` inside a property card is exempt: it carries the type word
        the page hides behind a click (`string`, a payload class), and
        `tabulate` needs it. Dropping it here would leave the Type cell reading
        `| null` instead of `string | null`.
        """
        for element in self._collect(set(names) or set(DROP)):
            if element.decomposed:
                continue
            if element.name == "button" and element.find_parent(class_=PROPERTY_CARD):
                continue
            element.decompose()
        return self

    def drop_chrome(self, *selectors):
        """Remove whole elements selected by id, class or custom tag."""
        for selector in set(selectors) or set(CHROME):
            for element in self.soup.select(selector):
                if not element.decomposed:
                    element.decompose()
        return self

    def isolate(self, *selectors):
        """Keep only the main content region, when a known one carries the page.

        The first matching container that holds at least REGION_SHARE of the
        body's text wins: everything beside it is removed. This strips the
        chrome that sits around GitHub READMEs and doxygen page bodies -
        navigation panes, file listings, footers - without ever removing a
        region's own content. A page with none of the containers is returned
        unchanged.
        """
        body = self.soup.body or self.soup
        total = len(body.get_text(" ", strip=True))
        for selector in set(selectors) or set(REGIONS):
            matches = self.soup.select(selector)
            if not matches or not total:
                continue
            region = matches[0]
            if len(region.get_text(" ", strip=True)) < REGION_SHARE * total:
                continue
            self._prune_to(body, region)
            return self
        return self

    def _prune_to(self, root, region):
        """Remove every descendant of root that does not contain region."""
        for child in list(root.children):
            if child is region:
                continue
            if getattr(child, "name", None) and region in child.descendants:
                self._prune_to(child, region)
            else:
                self._discard(child)

    @staticmethod
    def _discard(node):
        if getattr(node, "decomposed", False):
            return
        if getattr(node, "name", None):
            node.decompose()
        else:
            node.extract()

    def tabulate(self):
        """Replace card grids and field lists with plain tables.

        Three record structures survive cleaning only as glued lines, because
        their wrapper elements are unwrapped and their members carry no
        separators. Each becomes a real table before the unwrapping runs:

        - A parameter or property card (`div.group/property`) holds a name
          code, a type chip, an optional `Default` chip and a description
          block. The cards of one container become the rows of a
          `Parameter | Type | Default | Description` table, so every type,
          default and description lands in its own cell instead of being
          glued to the next card's name.
        - The Authorization card (`HTTPBearer` + `Authorization` +
          `Bearer <token>`) becomes a two-column `Scheme | Header` table with
          a single row.
        - A Sphinx `table.field-list` becomes a two-column `Field | Value`
          table with every block inside a cell flattened to inline content,
          because a GFM pipe-table cell cannot hold a list.
        """
        self._field_lists()
        self._authorization()
        self._cards()
        return self

    def _field_lists(self):
        for table in list(self.soup.find_all("table", class_="field-list")):
            if table.decomposed:
                continue
            for junk in table.find_all(["colgroup", "col"]):
                junk.decompose()
            rows = []
            for row in table.find_all("tr"):
                label, body = row.find("th"), row.find("td")
                if label is None or body is None:
                    continue
                label_cell = self.soup.new_tag("td")
                for child in list(label.children):
                    label_cell.append(child)
                value_cell = self.soup.new_tag("td")
                self._inline(body)
                for child in list(body.children):
                    value_cell.append(child)
                rows.append([label_cell, value_cell])
            if rows:
                table.replace_with(self._grid(["Field", "Value"], rows))

    def _authorization(self):
        for heading in list(self.soup.find_all(id=AUTH_HEADING)):
            if heading.name not in {"h1", "h2", "h3", "h4", "h5", "h6"}:
                continue
            if heading.parent is None:
                continue
            for sibling in heading.parent.next_siblings:
                if not getattr(sibling, "name", None):
                    continue
                if sibling.name in {"h1", "h2", "h3", "h4", "h5", "h6"} or sibling.find(
                    ["h1", "h2", "h3", "h4", "h5", "h6"]
                ):
                    break
                classes = set(sibling.get("class") or [])
                if not {"overflow-hidden", "rounded-xl", "border", "bg-fd-card"} <= classes:
                    continue
                if "HTTPBearer" not in sibling.get_text():
                    continue
                codes = sibling.find_all("code")
                if len(codes) < 2:
                    break
                scheme_cell = self.soup.new_tag("td")
                scheme_cell.append(codes[0].extract())
                header_cell = self.soup.new_tag("td")
                header_cell.append(codes[1].extract())
                if len(codes) > 2:
                    header_cell.append(NavigableString(" "))
                    header_cell.append(codes[2].extract())
                sibling.replace_with(self._grid(["Scheme", "Header"], [[scheme_cell, header_cell]]))
                break

    def _cards(self):
        groups = []
        for card in self.soup.find_all("div", class_=PROPERTY_CARD):
            if card.decomposed or card.parent is None:
                continue
            if not groups or groups[-1][0] is not card.parent:
                groups.append((card.parent, []))
            groups[-1][1].append(card)
        for parent, cards in groups:
            anchor = cards[0]
            rows = [row for row in (self._card_row(card) for card in cards) if row is not None]
            if not rows:
                continue
            anchor.insert_before(self._grid(["Parameter", "Type", "Default", "Description"], rows))
            for card in cards:
                card.decompose()

    def _card_row(self, card):
        """One table row from one card: name, type, default, description.

        A copy-link button is icon chrome and is dropped; a type-expander
        button carries the type word the page hides behind a click (`string`,
        a payload class name), so it is unwrapped and its text survives into
        the type cell.
        """
        for button in card.find_all("button"):
            # Only the type expander carries a type word, and it is the one with
            # aria-expanded. Every other button is icon chrome - and its svg may
            # already have been dropped, so the svg test alone would let the
            # copy-link label ("Copy Link") leak into the type cell.
            if button.get("aria-expanded") is not None:
                button.unwrap()
            else:
                button.decompose()
        for junk in card.find_all("svg"):
            junk.decompose()
        row, description = None, None
        for child in card.find_all("div", recursive=False):
            classes = set(child.get("class") or [])
            if "not-prose" in classes and row is None:
                row = child
            elif "flex-col" in classes and description is None:
                description = child
        if row is None:
            return None
        name = row.find("code")
        type_text = " ".join(
            child.get_text(" ", strip=True)
            for child in row.children
            if getattr(child, "name", None) and child is not name
        )
        default = None
        if description is not None:
            for chip in description.find_all("div"):
                label = chip.find("span", recursive=False)
                if label is None or label.get_text(strip=True) != "Default":
                    continue
                value = chip.find("code")
                if value is not None:
                    default = value.extract()
                chip.decompose()
        name_cell = self.soup.new_tag("td")
        if name is not None:
            name_cell.append(name.extract())
        type_cell = self.soup.new_tag("td")
        type_cell.append(NavigableString(type_text))
        default_cell = self.soup.new_tag("td")
        if default is not None:
            default_cell.append(default)
        description_cell = self.soup.new_tag("td")
        if description is not None:
            self._space_gap(description)
            self._inline(description)
            for child in list(description.children):
                description_cell.append(child)
        return [name_cell, type_cell, default_cell, description_cell]

    def _space_gap(self, element):
        """Insert a space between the adjacent children of a flex row.

        Flex chips are separated by the CSS `gap`, not by whitespace, so once
        the wrapper is gone pandoc glues them together - `Value in"compact"`
        instead of `Value in "compact"`. One space per abutting pair, only
        where neither side already carries whitespace.
        """
        for node in [element] + element.find_all(True):
            if "flex" not in (node.get("class") or []):
                continue
            children = list(node.children)
            for index in range(len(children) - 1):
                left, right = children[index], children[index + 1]
                left_text = str(left) if getattr(left, "name", None) is None else left.get_text()
                right_text = str(right) if getattr(right, "name", None) is None else right.get_text()
                if (
                    left_text
                    and right_text
                    and not left_text[-1].isspace()
                    and not right_text[0].isspace()
                ):
                    left.insert_after(NavigableString(" "))

    def expand_signatures(self):
        """Turn a Sphinx signature list into a paragraph plus a bullet list.

        A `dl.function` (or `dl.class`) glues the module prefix and the name
        into adjacent code spans - pandoc emits the broken
        `` `pymesh.``boolean` `` span - and leaves the parameters as italic
        fragments on the same glued line. The signature becomes one paragraph
        carrying the merged name, followed by one bullet per parameter; the
        description that follows the signature is untouched.
        """
        for dl in list(self.soup.find_all("dl")):
            if dl.decomposed or not (set(dl.get("class") or []) & SIGNATURE):
                continue
            for dt in list(dl.find_all("dt", recursive=False)):
                paragraph = self.soup.new_tag("p")
                for prefix in dt.find_all("em", recursive=False):
                    if "property" not in (prefix.get("class") or []):
                        continue
                    paragraph.append(NavigableString(text_of(prefix) + " "))
                    prefix.extract()
                name = self.soup.new_tag("code")
                for code in dt.find_all("code", recursive=False):
                    for child in list(code.children):
                        name.append(child.extract())
                if name.get_text():
                    paragraph.append(name)
                parameters = self.soup.new_tag("ul")
                for parameter in dt.find_all("em", recursive=False):
                    item = self.soup.new_tag("li")
                    item.append(parameter.extract())
                    parameters.append(item)
                dt.replace_with(paragraph)
                if len(parameters):
                    paragraph.insert_after(parameters)
            for dd in list(dl.find_all("dd", recursive=False)):
                dd.unwrap()
            if dl.parent is not None:
                dl.unwrap()
        return self

    def expand_definitions(self):
        """Convert simple definition lists to a two-column table.

        The rule, applied to every `dl` alike: a `dl` becomes a
        `Term | Definition` table exactly when it is not a signature list,
        does not sit inside a list item, a table cell, a paragraph or another
        definition list, and every one of its `dd` elements holds a single
        inline line. Every other `dl` is left for pandoc, which renders each
        term as its own line followed by the description - the honest
        fallback for descriptions a pipe-table cell cannot hold.
        """
        for dl in list(self.soup.find_all("dl")):
            if dl.decomposed or dl.parent is None:
                continue
            if set(dl.get("class") or []) & SIGNATURE:
                continue
            if dl.parent.name in {"li", "dt", "dd", "dl", "td", "th", "p", "pre"}:
                continue
            descriptions = dl.find_all("dd", recursive=False)
            if not descriptions or not all(self._single_line(dd) for dd in descriptions):
                continue
            rows, terms = [], []
            for child in list(dl.children):
                name = getattr(child, "name", None)
                if name == "dt":
                    terms.append(child)
                elif name == "dd" and terms:
                    rows.append((terms, child))
                    terms = []
            table_rows = []
            for terms, description in rows:
                term_cell = self.soup.new_tag("td")
                for term in terms:
                    self._inline(term)
                    if term is not terms[0]:
                        term_cell.append(NavigableString(" "))
                    for child in list(term.children):
                        term_cell.append(child)
                value_cell = self.soup.new_tag("td")
                self._inline(description)
                for child in list(description.children):
                    value_cell.append(child)
                table_rows.append([term_cell, value_cell])
            dl.replace_with(self._grid(["Term", "Definition"], table_rows))
        return self

    def separate_runs(self):
        """Split or drop runs of consecutive links and images.

        A flex container of sibling anchors - a collapsed table of contents -
        or a paragraph of badge images unwraps into one unbroken line, because
        nothing separates the members once their wrapper is gone. A run of
        three or more consecutive anchors or images with only whitespace
        between the members is therefore reshaped when it fills its whole
        container: a run of anchors that only points at `#` anchors - pure
        navigation - is dropped entirely, and any other run of inline members
        becomes a list, one member per item. A run that shares its container
        with other content stays untouched - it is prose with links, not a
        flattened container - and the converter's markdown stage reshapes
        whole-line runs the same way, so the two never disagree.
        """
        for container in list(self.soup.find_all(True)):
            if container.decomposed or container.name in {"td", "th", "pre", "code"}:
                continue
            if container.find_parent(["td", "th", "pre", "code"]):
                continue
            run = []
            for child in list(container.children):
                name = getattr(child, "name", None)
                if name in {"a", "img"}:
                    run.append(child)
                elif name is None and not str(child).strip():
                    continue
                elif run:
                    if len(run) >= RUN_MINIMUM:
                        self._run(container, run)
                    run = []
            if len(run) >= RUN_MINIMUM:
                self._run(container, run)
        return self

    def _run(self, container, run):
        others = [
            child
            for child in container.children
            if getattr(child, "name", None) and not any(child is member for member in run)
        ]
        if others:
            return
        anchors = [member for member in run if member.name == "a"]
        if (
            anchors
            and not any(member.name == "img" for member in run)
            and all((member.get("href") or "").startswith("#") for member in anchors)
        ):
            for member in run:
                if not member.decomposed:
                    member.decompose()
            return
        if not all(self._simple_member(member) for member in run):
            return
        listing = self.soup.new_tag("ul")
        for member in run:
            item = self.soup.new_tag("li")
            item.append(member.extract())
            listing.append(item)
        container.replace_with(listing)

    @staticmethod
    def _simple_member(member):
        """True when the run member renders as one inline token: an image, or a link whose content is inline."""
        if member.name == "img":
            return True
        return all(
            getattr(child, "name", None) is None or child.name in INLINE or child.name == "img"
            for child in member.children
        )

    def _single_line(self, element):
        """True when the element is one inline line: inline nodes or a single paragraph."""
        blocks = element.find_all(list(INLINE_BLOCKS) + ["table", "pre"])
        return not blocks or (len(blocks) == 1 and blocks[0].name == "p")

    def _inline(self, container):
        """Flatten the block descendants of a table cell to inline nodes.

        A GFM pipe-table cell is one line: every block inside a cell -
        paragraphs, list items, nested definition terms - is unwrapped in
        place, with a space where the block boundary was and `; ` between the
        items of a list, so the cell keeps its content and pandoc never falls
        back to raw HTML for the enclosing table.
        """
        for group in container.find_all(["ul", "ol"]):
            items = group.find_all("li", recursive=False)
            for item in items[:-1]:
                item.insert_after(NavigableString("; "))
        for block in container.find_all(INLINE_BLOCKS):
            block.insert(0, NavigableString(" "))
            block.append(NavigableString(":" if block.name == "dt" else " "))
            block.unwrap()

    def _grid(self, headers, rows):
        """Build a plain table: one header row, one row per record."""
        table = self.soup.new_tag("table")
        head = self.soup.new_tag("thead")
        header_row = self.soup.new_tag("tr")
        for header in headers:
            cell = self.soup.new_tag("th")
            cell.string = header
            header_row.append(cell)
        head.append(header_row)
        table.append(head)
        body = self.soup.new_tag("tbody")
        for cells in rows:
            row = self.soup.new_tag("tr")
            for cell in cells:
                row.append(cell)
            body.append(row)
        table.append(body)
        return table

    def unwrap(self, *names):
        """Remove a wrapper but keep its children in place."""
        for element in self._collect(set(names) or set(UNWRAP)):
            if not element.decomposed and element.parent is not None:
                element.unwrap()
        return self

    def lift_links(self):
        """Move a card link's href onto its first block child.

        <a href="x"><h3>Title</h3><p>Body</p></a> cannot be a Markdown link:
        pandoc emits an empty []() and strands the text. After lifting it is
        <h3><a href="x">Title</a></h3><p>Body</p>, which renders correctly.
        """
        for anchor in self._collect({"a"}):
            if anchor.decomposed or not anchor.get("href"):
                continue
            blocks = [child for child in anchor.children if getattr(child, "name", None) in BLOCK]
            if not blocks:
                continue
            first = blocks[0]
            link = self.soup.new_tag("a", href=anchor["href"])
            for child in list(first.contents):
                link.append(child.extract())
            first.append(link)
            anchor.unwrap()
        return self

    def separate_inline(self):
        """Insert a space where two word-like inline nodes abut.

        Badges and chips are marked up as adjacent inline elements with no
        whitespace between them (`<span>HTTPBearer</span><span>header</span>`),
        which pandoc concatenates into `HTTPBearerheader`. A space is inserted
        only when the left node ends and the right node starts with a letter or
        digit: punctuation stays attached (`/v1/nodes`), and code is never
        touched, because a space inside a command changes the command.
        """
        def visit(element, acc):
            if element.name in {"pre", "code"} or element.find_parent(["pre", "code"]):
                return acc
            children = list(element.children)
            for index in range(len(children) - 2, -1, -1):
                left, right = children[index], children[index + 1]
                left_text = left if isinstance(left, NavigableString) else left.get_text()
                right_text = right if isinstance(right, NavigableString) else right.get_text()
                if not left_text or not right_text:
                    continue
                if left_text[-1].isalnum() and right_text[0].isalnum():
                    element.insert(index + 1, " ")
            return acc

        fold(self.soup, visit)
        return self

    def rename_inline(self, *names):
        """Rename inline elements to their closest GFM-representable tag.

        pandoc's GFM writer has no markup for `kbd` and emits raw HTML
        (`<span class="kbd">`) in its place, which pollutes the converted
        Markdown. `kbd` becomes `code`: the keystroke stays distinguishable
        as keyboard text and no raw HTML survives.
        """
        mapping = RENAME if not names else {k: v for k, v in RENAME.items() if k in set(names)}
        for element in self._collect(set(mapping)):
            element.name = mapping[element.name]
        return self

    def flatten(self):
        """Remove constructs that force pandoc's raw-HTML fallback.

        A `<br>` inside a table cell cannot be expressed in a GFM pipe table, so
        pandoc abandons the whole table and re-emits it as raw HTML - colgroup,
        widths and all. A space is the honest single-line mapping. Spans carry
        no meaning once their attributes are stripped, so they are unwrapped
        after the spacing stage has used them as boundaries.
        """
        for cell in self._collect({"td", "th"}):
            for br in cell.find_all("br"):
                br.replace_with(" ")
        for span in self._collect({"span", "small", "font"}):
            if not span.decomposed and span.parent is not None:
                span.unwrap()
        return self

    def strip_attributes(self):
        """Keep only the attributes the converter actually needs.

        A `code` element keeps a normalised language class, because an
        unrecognised highlighting class makes pandoc fall back to raw HTML for
        the whole enclosing block.
        """
        def visit(element, acc):
            keep = KEEP.get(element.name, set())
            element.attrs = {
                name: value for name, value in element.attrs.items() if name in keep
            }
            if element.name == "code":
                language = language_of(element.attrs.get("class", ""))
                element.attrs = {"class": language} if language else {}
            return acc

        fold(self.soup, visit)
        return self

    def links(self):
        """Every anchor href with its text, deduplicated, in document order."""
        seen = set()
        found = []

        def visit(element, acc):
            if element.name == "a" and element.get("href"):
                href = element["href"]
                if href not in seen and not href.startswith("#"):
                    seen.add(href)
                    acc.append((text_of(element) or href, href))
            return acc

        return fold(self.soup, visit, found)

    def html(self):
        return str(self.soup)


def clean(html):
    return (
        Document(html)
        .drop()
        .drop_chrome()
        .isolate()
        .tabulate()
        .expand_signatures()
        .expand_definitions()
        .separate_runs()
        .rename_inline()
        .unwrap()
        .separate_inline()
        .flatten()
        .lift_links()
        .strip_attributes()
        .html()
    )
