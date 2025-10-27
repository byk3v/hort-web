import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";

    const upstream = await fetch(`${BASE}/api/checkout/search?q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    if (!upstream.ok) {
        return NextResponse.json(
            { message: "Upstream error" },
            { status: upstream.status }
        );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
}
