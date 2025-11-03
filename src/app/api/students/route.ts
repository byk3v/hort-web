import { NextResponse } from 'next/server';

const BASE = process.env.BACKEND_API_URL ?? 'http://localhost:4000';

function buildAuthHeaders(req: Request, base: Record<string,string>) {
    const auth = req.headers.get('authorization');
    if (auth) base.Authorization = auth;
    return base;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') ?? '';
    const groupId = searchParams.get('groupId') ?? '';

    const qs = new URLSearchParams();
    if (name) qs.set('name', name);
    if (groupId) qs.set('groupId', groupId);

    const headers = buildAuthHeaders(req, { Accept: 'application/json' });

    const res = await fetch(`${BASE}/api/students${qs.toString() ? `?${qs}` : ''}`, {
        cache: 'no-store',
        headers
    });

    if (!res.ok) {
        return NextResponse.json({ message: 'Upstream error' }, { status: res.status });
    }
    return NextResponse.json(await res.json());
}

export async function POST(req: Request) {
    const body = await req.json();
    const headers = buildAuthHeaders(req, {
        'content-type': 'application/json'
    });
    const res = await fetch(`${BASE}/api/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}
