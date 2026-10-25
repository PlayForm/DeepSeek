// Strip `//` and `/* ... *\/` comments while preserving string literals.
// Returns the source with comments removed and the original line structure
// kept (the whitespace pass collapses it afterwards).
export default (Source) => {
	const Out = [];
	let Index = 0;
	let Quote = "";
	while (Index < Source.length) {
		const Char = Source[Index];
		switch (true) {
			// Inside a quoted string: copy verbatim, honour escapes and the
			// matching quote only.
			case Quote !== "": {
				Out.push(Char);
				Index += 1;
				switch (true) {
					case Char === "\\":
						if (Index < Source.length) {
							Out.push(Source[Index]);
							Index += 1;
						}
						break;
					case Char === Quote:
						Quote = "";
						break;
				}
				break;
			}
			// Line comment: drop through the end of the line (the newline is
			// kept so the whitespace pass still separates the neighbours).
			case Char === "/" && Source[Index + 1] === "/": {
				while (Index < Source.length && Source[Index] !== "\n") {
					Index += 1;
				}
				break;
			}
			// Block comment: drop through the closing marker.
			case Char === "/" && Source[Index + 1] === "*": {
				Index += 2;
				while (
					Index < Source.length &&
					!(Source[Index] === "*" && Source[Index + 1] === "/")
				) {
					Index += 1;
				}
				Index += 2;
				break;
			}
			// The opening of a string or template literal.
			case Char === '"' || Char === "'" || Char === "`": {
				Quote = Char;
				Out.push(Char);
				Index += 1;
				break;
			}
			default: {
				Out.push(Char);
				Index += 1;
			}
		}
	}
	return Out.join("");
};
