export type Kind = "proposal" | "decision";
export interface Envelope {
    kind: Kind;
    id: string;
    payload: Record<string, unknown> | undefined;
}
export default _default;
declare function _default(Text: string): Envelope | null;
