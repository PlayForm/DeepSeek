// Price - the one money formatter both halves render with, copied verbatim
// from the design's Price ladder: the USD symbol, the currency word for any
// other currency, a sub-micro floor, and a digit ladder of two decimals at
// a dollar and up, four below it, six below a cent.
import Dash from "@Variable/Dash";

export default function Price(Value: number | null, Currency: string): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	const Sign = Value < 0 ? "-" : "";
	const Symbol = Currency === "USD" ? "$" : `${Currency} `;
	const Size = Math.abs(Value);
	switch (true) {
		case Size > 0 && Size < 0.000001:
			return `<${Symbol}0.000001`;
		default: {
			// A zero is a clean two-decimal figure, not a six-decimal one:
			// the ladder's sub-cent precision is for a real sub-cent amount.
			const Digits = Size === 0 || Size >= 1 ? 2 : Size >= 0.01 ? 4 : 6;
			const Fixed = Size.toFixed(Digits);
			const Dot = Fixed.indexOf(".");
			const Grouped = Fixed.slice(0, Dot).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return `${Sign}${Symbol}${Grouped}.${Fixed.slice(Dot + 1)}`;
		}
	}
}
