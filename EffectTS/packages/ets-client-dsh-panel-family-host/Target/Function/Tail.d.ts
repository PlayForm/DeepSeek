export type TailResult = {
    ok: true;
    namespace: string;
    lines: string[];
} | {
    ok: false;
    code: "rejected" | "not-found";
    message: string;
};
export default function Tail(logRoot: string, maxLines: number, namespace: string, lines: number): Promise<TailResult>;
