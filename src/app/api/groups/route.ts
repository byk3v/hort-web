import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

function buildAuthHeaders(req: Request, base: Record<string,string>) {
    const auth = req.headers.get('authorization');
    if (auth) base.Authorization = auth;
    return base;
}

export async function GET(req: Request) {
    const headers = buildAuthHeaders(req, { Accept: 'application/json' });
    const upstream = await fetch(`${BASE}/api/groups`, {
        headers,
        // cache: "no-store", // descomenta si no quieres cache
    });

    if (!upstream.ok) {
        return NextResponse.json({ message: "Upstream error" }, { status: upstream.status });
    }
    return NextResponse.json(await upstream.json());
}