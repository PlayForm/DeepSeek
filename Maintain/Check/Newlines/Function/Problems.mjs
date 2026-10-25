export default (Content) => {
	const Problems = [];
	if (!Content.endsWith("\n")) Problems.push("missing final LF");
	else if (Content.endsWith("\n\n")) Problems.push("trailing blank lines");
	if (Content.includes("\r")) Problems.push("CRLF");
	if (/[ \t]+(?=\n|$)/.test(Content)) Problems.push("trailing whitespace");
	return Problems;
};
