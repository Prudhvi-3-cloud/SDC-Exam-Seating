"use client";

import { getSession } from "@/lib/session";
import { PORTAL_SESSION_HEADER } from "@/lib/portal-session";

export function buildPortalSessionHeader(): Record<string, string> {
  const session = getSession();
  if (!session) {
    return {};
  }
  return {
    [PORTAL_SESSION_HEADER]: JSON.stringify(session),
  };
}

export async function fetchPortal(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const sessionHeaders = buildPortalSessionHeader();
  Object.entries(sessionHeaders).forEach(([key, value]) => headers.set(key, value));

  return fetch(input, {
    ...init,
    headers,
  });
}
