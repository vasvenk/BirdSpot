import { NextResponse } from "next/server";

import { paginationSchema } from "@/lib/validations";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getPaginationFromUrl(url: string) {
  const searchParams = new URL(url).searchParams;
  return paginationSchema.parse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export function getRequestIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export function parseCursor(cursor: string | null | undefined) {
  if (!cursor) {
    return null;
  }

  const [createdAt, id] = cursor.split("::");

  if (!createdAt || !id) {
    return null;
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return { createdAt: date, id };
}

export function buildCursor(createdAt: Date, id: string) {
  return `${createdAt.toISOString()}::${id}`;
}
