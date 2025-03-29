import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST() {
    const gameId = nanoid(8)

    return NextResponse.json({ gameId })
}