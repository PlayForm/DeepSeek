/**
 * @module CountShort
 *
 * The compact token formatter of the tokens column: the K and M ladder the harness tokens cells
 * use.
 *
 * @remarks
 *
 * Two decimals below 1,000, one decimal from 1,000 up, and one decimal M from 10,000,000 up.
 */
export default function CountShort(Value: number | null): string;
