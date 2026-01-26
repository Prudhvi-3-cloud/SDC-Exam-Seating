'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { mockUsers } from '@/lib/mockAuth';
import { setSession } from '@/lib/session';

type LoginRole = 'student' | 'faculty' | 'admin';

export function LoginPage({
  initialRole,
  singleRole = false,
}: {
  initialRole?: LoginRole;
  singleRole?: boolean;
}) {
  const router = useRouter();
  const fallbackRole: LoginRole = initialRole ?? 'student';
  const [activeTab, setActiveTab] = useState<LoginRole>(fallbackRole);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);
  const [facultyError, setFacultyError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const availableRoles = useMemo(() => {
    return singleRole ? [fallbackRole] : (['student', 'faculty', 'admin'] as LoginRole[]);
  }, [fallbackRole, singleRole]);

  useEffect(() => {
    setActiveTab(fallbackRole);
  }, [fallbackRole]);

  const handleStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStudentError(null);
    const normalizedEmail = studentEmail.trim().toLowerCase();
    const user = mockUsers.find(
      (entry) =>
        entry.role === 'student' &&
        entry.email.toLowerCase() === normalizedEmail &&
        entry.password === studentPassword
    );

    if (!user) {
      setStudentError('Invalid student credentials.');
      return;
    }

    setSession({ email: user.email, role: user.role, name: user.name });
    router.replace('/portal/student');
  };

  const handleFacultySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFacultyError(null);
    const normalizedEmail = facultyEmail.trim().toLowerCase();
    const user = mockUsers.find(
      (entry) =>
        entry.role === 'faculty' &&
        entry.email.toLowerCase() === normalizedEmail &&
        entry.password === facultyPassword
    );

    if (!user) {
      setFacultyError('Invalid faculty credentials.');
      return;
    }

    setSession({ email: user.email, role: user.role, name: user.name });
    router.replace('/portal/faculty');
  };

  const handleAdminSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError(null);
    const normalizedEmail = adminEmail.trim().toLowerCase();
    const user = mockUsers.find(
      (entry) =>
        entry.role === 'admin' &&
        entry.email.toLowerCase() === normalizedEmail &&
        entry.password === adminPassword
    );

    if (!user) {
      setAdminError('Invalid admin credentials.');
      return;
    }

    setSession({ email: user.email, role: user.role, name: user.name });
    router.replace('/portal/admin');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-primary-foreground">SR</span>
          </div>
          <h1 className="text-3xl mb-2">Welcome to SRIT</h1>
          <p className="text-muted-foreground">Please login to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          {singleRole ? null : (
            <div className="flex border-b border-border">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`flex-1 py-4 text-center transition-colors ${
                    activeTab === role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {role === 'student'
                    ? 'Student Login'
                    : role === 'faculty'
                      ? 'Faculty Login'
                      : 'Admin Login'}
                </button>
              ))}
            </div>
          )}

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'student' ? (
              <form className="space-y-6" onSubmit={handleStudentSubmit}>
                {singleRole ? (
                  <div className="text-center text-xl sm:text-2xl font-semibold text-muted-foreground">
                    Student Login
                  </div>
                ) : null}
                <div>
                  <label className="block text-sm mb-2">Student Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
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
                      type={showStudentPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={studentPassword}
                      onChange={(event) => setStudentPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowStudentPassword((prev) => !prev)}
                    >
                      {showStudentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {studentError ? (
                  <div className="text-sm text-destructive">{studentError}</div>
                ) : null}

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <a href="#" className="text-primary hover:underline">
                    Contact Admin
                  </a>
                </div>
              </form>
            ) : (
              <form
                className="space-y-6"
                onSubmit={activeTab === 'faculty' ? handleFacultySubmit : handleAdminSubmit}
              >
                {singleRole ? (
                  <div className="text-center text-xl sm:text-2xl font-semibold text-muted-foreground">
                    {activeTab === 'faculty' ? 'Faculty Login' : 'Admin Login'}
                  </div>
                ) : null}
                {activeTab === 'faculty' ? (
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
                      value={facultyEmail}
                      onChange={(event) => setFacultyEmail(event.target.value)}
                    />
                  </div>
                </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-2">Admin Email</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={adminEmail}
                        onChange={(event) => setAdminEmail(event.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={
                        activeTab === 'faculty'
                          ? showFacultyPassword
                            ? 'text'
                            : 'password'
                          : showAdminPassword
                            ? 'text'
                            : 'password'
                      }
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={activeTab === 'faculty' ? facultyPassword : adminPassword}
                      onChange={(event) =>
                        activeTab === 'faculty'
                          ? setFacultyPassword(event.target.value)
                          : setAdminPassword(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      aria-label={
                        activeTab === 'faculty'
                          ? showFacultyPassword
                            ? 'Hide password'
                            : 'Show password'
                          : showAdminPassword
                            ? 'Hide password'
                            : 'Show password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        activeTab === 'faculty'
                          ? setShowFacultyPassword((prev) => !prev)
                          : setShowAdminPassword((prev) => !prev)
                      }
                    >
                      {activeTab === 'faculty' ? (
                        showFacultyPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )
                      ) : showAdminPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {activeTab === 'faculty' && facultyError ? (
                  <div className="text-sm text-destructive">{facultyError}</div>
                ) : null}
                {activeTab === 'admin' && adminError ? (
                  <div className="text-sm text-destructive">{adminError}</div>
                ) : null}

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>

                <div className="text-center text-sm text-muted-foreground">
                  Need access?{' '}
                  <a href="#" className="text-primary hover:underline">
                    {activeTab === 'admin' ? 'Contact IT' : 'Contact HR'}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>For technical support, contact: support@srit.edu.in</p>
        </div>
      </div>
    </div>
  );
}
