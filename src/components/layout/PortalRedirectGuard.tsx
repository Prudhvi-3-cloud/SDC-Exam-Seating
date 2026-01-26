"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

export default function PortalRedirectGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/portal")) {
      return;
    }

    const session = getSession();
    if (!session) {
      return;
    }

    router.replace(`/portal/${session.role}`);
  }, [pathname, router]);

  return null;
}
