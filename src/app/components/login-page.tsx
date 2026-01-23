'use client';

import { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');

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
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'student'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === 'faculty'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              Faculty Login
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'student' ? (
              <form className="space-y-6">
                <div>
                  <label className="block text-sm mb-2">Roll Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your roll number"
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    />
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

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <a href="#" className="text-primary hover:underline">
                    Contact Admin
                  </a>
                </div>
              </form>
            ) : (
              <form className="space-y-6">
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
                    />
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

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>

                <div className="text-center text-sm text-muted-foreground">
                  Need access?{' '}
                  <a href="#" className="text-primary hover:underline">
                    Contact HR
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
