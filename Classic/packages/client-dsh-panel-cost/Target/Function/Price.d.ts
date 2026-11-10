/**
 * @module Price
 *
 * The one money formatter both halves render with, copied verbatim from the design's Price ladder.
 *
 * @remarks
 *
 * The USD symbol, the currency word for any other currency, a signed sub-micro floor, and a digit
 * ladder of two decimals at a dollar and up, four below it, six below a cent.
 */
export default function Price(Value: number | null, Currency: string): string;
