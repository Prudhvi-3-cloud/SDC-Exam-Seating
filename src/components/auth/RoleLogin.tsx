"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/session";
import { getSession, setSession } from "@/lib/session";
import { mockUsers } from "@/lib/mockAuth";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

export default function RoleLogin({ role }: { role: Role }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.replace(`/portal/${session.role}`);
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const user = mockUsers.find(
      (entry) =>
        entry.role === role &&
        entry.email.toLowerCase() === normalizedEmail &&
        entry.password === password
    );

    if (!user) {
      setError(`Invalid ${roleLabels[role].toLowerCase()} credentials.`);
      setIsSubmitting(false);
      return;
    }

    setSession({ email: user.email, role: user.role, name: user.name });
    router.replace(`/portal/${user.role}`);
  };

  return (
    <div className="portal-auth">
      <div className="portal-auth-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="portal-brand">SRIT Portal Access</p>
          <h1 className="portal-auth-title">{roleLabels[role]} login</h1>
          <p className="portal-auth-muted">Use the demo credentials for this role.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="portal-password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input portal-password-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="portal-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error ? <div className="portal-notice">{error}</div> : null}
          <div className="portal-auth-actions">
            <button type="submit" className="portal-button" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <div className="portal-auth-muted">Role: {roleLabels[role]}</div>
          </div>
          <a className="portal-auth-muted" href="/login">
            Back to main login
          </a>
        </form>
      </div>
    </div>
  );
}
