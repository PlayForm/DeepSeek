/**
 * @module Share
 *
 * The square-root bar scale, ported one for one from the harness.
 *
 * @remarks
 *
 * The fill of a row is the square root of its total over the scale it compares against, so a
 * half-money row fills about 71 percent of the track. No scale is full width; a non-positive total
 * is an empty track.
 */
export default function Share(Total: number, Scale: number): number;
