"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { mockUsers } from "@/lib/mockAuth";
import { setSession } from "@/lib/session";

const ADMIN_EMAIL = "admin@srit.ac.in";
const ADMIN_PASSWORD = "admin";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const portalAdmin = mockUsers.find(
      (entry) =>
        entry.role === "admin" &&
        entry.email.toLowerCase() === normalizedEmail &&
        entry.password === password
    );

    if (portalAdmin) {
      setSession({ email: portalAdmin.email, role: portalAdmin.role, name: portalAdmin.name });
      router.push("/portal/admin");
      return;
    }

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid admin credentials.");
      return;
    }

    localStorage.setItem("sritAdminAuthed", "true");
    router.push("/admin");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-secondary py-12 px-4 relative">
      <div className="absolute left-6 top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
        >
          ← Back
        </Link>
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-primary-foreground">SR</span>
          </div>
          <h1 className="text-3xl mb-2">Admin Login</h1>
          <p className="text-muted-foreground">
            Use admin credentials to continue. Portal admins can sign in too.
          </p>
        </div>

        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-border">
            <div className="flex-1 py-4 text-center bg-primary text-primary-foreground">
              Admin Access
            </div>
          </div>

          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error ? <div className="text-sm text-destructive">{error}</div> : null}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>For admin access, contact: it@srit.ac.in</p>
        </div>
      </div>
    </div>
  );
}
