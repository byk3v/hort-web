import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export async function GET(req: Request) {
    const upstream = await fetch(`${BASE}/api/groups`, {
        headers: { Accept: "application/json" },
        // cache: "no-store", // descomenta si no quieres cache
    });

    if (!upstream.ok) {
        return NextResponse.json({ message: "Upstream error" }, { status: upstream.status });
    }
    return NextResponse.json(await upstream.json());
}