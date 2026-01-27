export type Role = "admin" | "faculty" | "student";

export type Session = {
  userId: string;
  email: string;
  role: Role;
  name: string;
};

const SESSION_KEY = "sritPortalSession";

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.userId || !parsed?.email || !parsed?.role || !parsed?.name) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
