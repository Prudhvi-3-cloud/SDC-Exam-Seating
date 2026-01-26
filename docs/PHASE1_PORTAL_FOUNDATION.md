# Phase 1 Portal Foundation

## Routes added
- /login
- /portal/student
- /portal/faculty
- /portal/admin

Role-specific login variants (UI switches based on query):
- /login?role=student
- /login?role=faculty
- /login?role=admin

Portal layout group: src/app/(portal)/layout.tsx

## Demo login users (Phase 1 only)
Note: Phase 2 switches portal auth to DB-backed users. See docs/PHASE2_ADMIN_CORE.md for active credentials.
Admins
- principal.admin@srit.ac.in / sritadmin1 (Dr. Rao)
- examcell.admin@srit.ac.in / sritadmin2 (Ms. Priya)
- it.admin@srit.ac.in / sritadmin3 (Mr. Rakesh)

Faculty
- cse.faculty@srit.ac.in / sritfaculty1 (Prof. Anjali)
- ece.faculty@srit.ac.in / sritfaculty2 (Prof. Naveen)
- mech.faculty@srit.ac.in / sritfaculty3 (Prof. Dinesh)

Students
- student01@srit.ac.in / sritstudent1 (Asha)
- student02@srit.ac.in / sritstudent2 (Vikram)
- student03@srit.ac.in / sritstudent3 (Meera)

## Session + guard behavior
- Session storage: localStorage key `sritPortalSession` (src/lib/session.ts).
- /portal/* routes are guarded in src/app/(portal)/layout.tsx.
- If no session, client-side redirect to /login.
- If the role in session does not match the URL, redirect to /portal/{role}.
- Logout clears session and returns to /login.

## SRIT theme tokens
- Token location: src/app/globals.css (SRIT portal tokens + portal UI classes).
- Primary brand token: --srit-primary (#FF5421) used for buttons, focus rings, active nav.
- Supporting tokens: --srit-bg, --srit-surface, --srit-text, --srit-muted, --srit-border, --srit-shadow.

## Mobile sidebar behavior
- Desktop: sidebar stays visible alongside content.
- Mobile (<= 900px): sidebar hides and opens via hamburger into a drawer overlay.
- Drawer supports overlay click + Escape key to close.
