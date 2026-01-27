import Link from "next/link";
import { LoginPage as LegacyLoginPage } from "@/app/components/login-page";

const allowedRoles = ["student", "faculty", "admin"] as const;

type LoginSearchParams = Promise<{ role?: string | string[] }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const resolved = await searchParams;
  const roleParam = Array.isArray(resolved.role) ? resolved.role[0] : resolved.role;
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
          {"<- Back"}
        </Link>
      </div>
      <LegacyLoginPage initialRole={role} singleRole />
    </div>
  );
}
