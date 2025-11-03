import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

function buildAuthHeaders(req: Request, base: Record<string,string>) {
    const auth = req.headers.get('authorization');
    if (auth) base.Authorization = auth;
    return base;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";

    const headers = buildAuthHeaders(req, { Accept: 'application/json' });

    const upstream = await fetch(`${BASE}/api/checkout/search?q=${encodeURIComponent(q)}`, {
        headers,
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
