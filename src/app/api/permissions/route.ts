import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "ACTIVE";

    const upstream = await fetch(`${BASE}/api/permissions?status=${encodeURIComponent(status)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    if (!upstream.ok) {
        return NextResponse.json({ message: "Upstream error" }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();

    const upstream = await fetch(`${BASE}/api/permissions`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!upstream.ok) {
        return NextResponse.json(
            { message: "Upstream error" },
            { status: upstream.status }
        );
    }

    // Spring responde 201 sin body
    return NextResponse.json({}, { status: 201 });
}
