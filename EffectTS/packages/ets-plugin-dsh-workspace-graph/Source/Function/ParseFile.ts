// ParseFile - the v0 parser for one file's text: the entry behind Index.
// TypeScript/JavaScript: the File node over the whole text, one Symbol node
// per declaration (ScanSymbols), one Block node per multi-line symbol body
// (kind `body`), the contains edges, the relative-import edges (a
// non-relative specifier is recorded as skipped - never a fake node), and
// the Test node plus its contains edge when the path is a test path
// (`*.test.ts`/`*.test.tsx`/`*.test.js` or a `Test.ts` segment).
// Markdown: the File node, one DocSection per heading (ScanMarkdown) and the
// contains edges. Every node carries the file version token it was parsed
// from; every fingerprint is content-derived (Fingerprint).
import * as NodePath from "node:path";

import type Edge from "@Interface/Edge.js";
import type { EdgeKind } from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

import Fingerprint from "./Fingerprint.js";
import ScanImports from "./ScanImports.js";
import ScanMarkdown from "./ScanMarkdown.js";
import ScanSymbols from "./ScanSymbols.js";

export interface Parsed {
	nodes: Node[];
	edges: Edge[];
	skipped: { specifier: string; line: number }[];
	fileFingerprint: string;
}

const TestPath = /(^|\/)([^/]+\.test\.(ts|tsx|js)|Test\.tsx?)$/;

export default (
	Path: string,
	Text: string,
	Language: "typescript" | "javascript" | "markdown",
	Version: string,
): Parsed => {
	const Lines = Text.replace(/\r\n/g, "\n").split("\n");
	if (Lines.at(-1) === "") {
		Lines.pop();
	}
	const Slice = (Span_: { startLine: number; endLine: number }): string =>
		Lines.slice(Span_.startLine - 1, Span_.endLine).join("\n");
	const Nodes: Node[] = [];
	const Edges: Edge[] = [];
	const Skipped: { specifier: string; line: number }[] = [];
	const FileId = `File:${Path}`;
	const FileSpan = { startLine: 1, endLine: Lines.length };
	const FileFingerprint = Fingerprint(Lines.join("\n"), "File");
	const FileNode: Node = {
		id: FileId,
		kind: "File",
		path: Path,
		language: Language,
		span: FileSpan,
		fingerprint: FileFingerprint,
		version: Version,
	};
	Nodes.push(FileNode);
	const Contains = (To: string, Span_: { startLine: number; endLine: number }): void => {
		Edges.push({ kind: "contains", from: FileId, to: To, span: Span_ });
	};
	if (Language === "markdown") {
		for (const Section of ScanMarkdown(Lines)) {
			const SectionId = `DocSection:${Path}:${Section.span.startLine}`;
			Nodes.push({
				id: SectionId,
				kind: "DocSection",
				path: Path,
				name: Section.title,
				language: "markdown",
				span: Section.span,
				fingerprint: Fingerprint(Slice(Section.span), "DocSection", Section.title),
				version: Version,
			});
			Contains(SectionId, Section.span);
		}
		return { nodes: Nodes, edges: Edges, skipped: Skipped, fileFingerprint: FileFingerprint };
	}
	for (const Symbol of ScanSymbols(Lines)) {
		const SymbolId = `Symbol:${Path}:${Symbol.name}`;
		Nodes.push({
			id: SymbolId,
			kind: "Symbol",
			path: Path,
			name: Symbol.name,
			language: Language,
			span: Symbol.span,
			fingerprint: Fingerprint(Slice(Symbol.span), "Symbol", Symbol.name),
			version: Version,
		});
		Contains(SymbolId, Symbol.span);
		if (Symbol.body !== undefined) {
			const BodyId = `Block:${Path}:${Symbol.body.startLine}:body`;
			Nodes.push({
				id: BodyId,
				kind: "Block",
				path: Path,
				language: Language,
				span: Symbol.body,
				fingerprint: Fingerprint(Slice(Symbol.body), "Block"),
				version: Version,
			});
			Contains(BodyId, Symbol.body);
		}
	}
	for (const Import of ScanImports(Lines)) {
		if (Import.specifier.startsWith(".")) {
			const TargetPath = NodePath.join(NodePath.dirname(Path), Import.specifier)
				.split(NodePath.sep)
				.join("/");
			Edges.push({
				kind: "imports" satisfies EdgeKind,
				from: FileId,
				to: `File:${TargetPath}`,
				span: { startLine: Import.line, endLine: Import.line },
			});
		} else {
			Skipped.push({ specifier: Import.specifier, line: Import.line });
		}
	}
	if (TestPath.test(Path)) {
		const TestId = `Test:${Path}`;
		Nodes.push({
			id: TestId,
			kind: "Test",
			path: Path,
			language: Language,
			span: FileSpan,
			fingerprint: Fingerprint(Lines.join("\n"), "Test"),
			version: Version,
		});
		Contains(TestId, FileSpan);
	}
	return { nodes: Nodes, edges: Edges, skipped: Skipped, fileFingerprint: FileFingerprint };
};
