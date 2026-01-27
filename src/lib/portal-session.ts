import { z } from "zod";
import type { Session } from "@/lib/session";

export const PORTAL_SESSION_HEADER = "x-srit-session";

const sessionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "faculty", "student"]),
  name: z.string().min(1),
});

export function getPortalSessionFromRequest(request: Request): Session | null {
  const rawHeader = request.headers.get(PORTAL_SESSION_HEADER);
  if (!rawHeader) {
    return null;
  }

  try {
    const parsedJson = JSON.parse(rawHeader);
    const parsed = sessionSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function isStudentSession(session: Session | null): session is Session & { role: "student" } {
  return Boolean(session && session.role === "student");
}

export function isFacultySession(session: Session | null): session is Session & { role: "faculty" } {
  return Boolean(session && session.role === "faculty");
}
