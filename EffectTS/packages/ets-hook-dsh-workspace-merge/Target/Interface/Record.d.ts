import type Reply from "./Reply.js";
export default interface Record {
    id: string;
    status: "applied" | "partial" | "rejected";
    sequence: number;
    replies: Reply[];
}
