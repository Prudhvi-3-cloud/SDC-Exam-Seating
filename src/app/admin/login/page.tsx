"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";

const ADMIN_EMAIL = "admin@srit.ac.in";
const ADMIN_PASSWORD = "admin";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid admin credentials.");
      return;
    }
    localStorage.setItem("sritAdminAuthed", "true");
    router.push("/admin");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-primary-foreground">SR</span>
          </div>
          <h1 className="text-3xl mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Use admin credentials to continue</p>
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
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
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
