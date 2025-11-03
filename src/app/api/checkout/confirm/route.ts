import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

function buildAuthHeaders(req: Request, base: Record<string,string>) {
    const auth = req.headers.get('authorization');
    if (auth) base.Authorization = auth;
    return base;
}

export async function POST(req: Request) {
    const body = await req.json();
    const headers = buildAuthHeaders(req, {
        'content-type': 'application/json',
        Accept: 'application/json'
    });

    const upstream = await fetch(`${BASE}/api/checkout/confirm`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!upstream.ok) {
        return NextResponse.json(
            { message: "Upstream error" },
            { status: upstream.status }
        );
    }

    return NextResponse.json({}, { status: 201 });
}
