"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function SritShell({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title?: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="utility-bar">
        <div className="container">
          <div>SRIT Exam Seating Prototype</div>
          <div className="utility-links">
            <a href="https://www.srit.ac.in/" target="_blank" rel="noreferrer">
              SRIT Home
            </a>
            <span>Admissions</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-placeholder">
            <img
              src="/srit-logo.png"
              alt="SRIT logo"
              className="logo-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <span>SRIT</span>
          </div>
          <div className="brand-text">
            <span>SRINIVASA RAMANUJAN INSTITUTE OF TECHNOLOGY</span>
            <h1>{title ?? "Exam Seating Arrangement"}</h1>
            {subtitle ? <div>{subtitle}</div> : null}
          </div>
          <div className="nav-actions">
            <Link className="button button-outline" href="/portal/admin/examplanning">
              Admin Home
            </Link>
          </div>
        </div>
      </header>
      <main
        className={wide ? "container container-wide" : "container"}
        style={{ padding: "2rem 0 3rem" }}
      >
        {children}
      </main>
    </div>
  );
}
