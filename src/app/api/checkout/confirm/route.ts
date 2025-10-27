import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export async function POST(req: Request) {
    const body = await req.json();

    const upstream = await fetch(`${BASE}/api/checkout/confirm`, {
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

    return NextResponse.json({}, { status: 201 });
}
