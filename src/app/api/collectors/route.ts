import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export async function GET() {
    const upstream = await fetch(`${BASE}/api/collectors`, {
        headers: { Accept: "application/json" },
        // cache: "no-store",
    });

    if (!upstream.ok) {
        return NextResponse.json({ message: "Upstream error" }, { status: upstream.status });
    }
    return NextResponse.json(await upstream.json());
}