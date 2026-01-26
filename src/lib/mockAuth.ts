import type { Role } from "./session";

export type MockUser = {
  email: string;
  password: string;
  role: Role;
  name: string;
};

export const mockUsers: MockUser[] = [
  { email: "principal.admin@srit.ac.in", password: "sritadmin1", role: "admin", name: "Dr. Rao" },
  { email: "examcell.admin@srit.ac.in", password: "sritadmin2", role: "admin", name: "Ms. Priya" },
  { email: "it.admin@srit.ac.in", password: "sritadmin3", role: "admin", name: "Mr. Rakesh" },
  { email: "cse.faculty@srit.ac.in", password: "sritfaculty1", role: "faculty", name: "Prof. Anjali" },
  { email: "ece.faculty@srit.ac.in", password: "sritfaculty2", role: "faculty", name: "Prof. Naveen" },
  { email: "mech.faculty@srit.ac.in", password: "sritfaculty3", role: "faculty", name: "Prof. Dinesh" },
  { email: "student01@srit.ac.in", password: "sritstudent1", role: "student", name: "Asha" },
  { email: "student02@srit.ac.in", password: "sritstudent2", role: "student", name: "Vikram" },
  { email: "student03@srit.ac.in", password: "sritstudent3", role: "student", name: "Meera" }
];
