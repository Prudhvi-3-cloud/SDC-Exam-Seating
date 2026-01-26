"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginPage as LegacyLoginPage } from "@/app/components/login-page";

const allowedRoles = ["student", "faculty", "admin"] as const;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role = allowedRoles.includes(roleParam as (typeof allowedRoles)[number])
    ? (roleParam as (typeof allowedRoles)[number])
    : "student";

  return (
    <div className="relative">
      <div className="absolute left-6 top-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
        >
          ← Back
        </Link>
      </div>
      <LegacyLoginPage initialRole={role} singleRole />
    </div>
  );
}
