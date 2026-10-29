export default interface Touch {
    readonly SessionId: string;
    readonly Turn: number;
    readonly Step: number;
    readonly Seq: number;
    readonly CallKey: string;
    readonly Tool: string;
    readonly Path: string;
    readonly Kind: "read" | "write" | "edit" | "delete" | "search";
    readonly BytesBefore: number | null;
    readonly BytesAfter: number | null;
    readonly BytesDelta: number | null;
}
