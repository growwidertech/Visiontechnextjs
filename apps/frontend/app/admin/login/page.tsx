'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/Providers';
import { BrandLogo } from '@/components/Navbar';

const DEMO_ROLES = [
  { role: 'Super Administrator', email: 'admin@visiontechsolutions.co.in' },
  { role: 'Administrator', email: 'admin.ops@visiontechsolutions.co.in' },
  { role: 'Content Manager', email: 'content@visiontechsolutions.co.in' },
  { role: 'Gallery Manager', email: 'gallery@visiontechsolutions.co.in' },
  { role: 'Project Manager', email: 'projects@visiontechsolutions.co.in' },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@visiontechsolutions.co.in');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setForgotSent(
        'Password reset instructions have been generated for this account.'
      );
    } catch (err: any) {
      setError(err.message || 'Unable to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070F19] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle architectural background */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#070F19]/90" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo />
          <div className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/30 text-gold text-[11px] uppercase tracking-[0.2em] font-semibold px-3.5 py-1 rounded-full mt-2">
            <Shield className="w-3.5 h-3.5" /> Enterprise CMS Administration
          </div>
        </div>

        <div className="bg-[#0B1623]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-7 sm:p-8 shadow-2xl space-y-5">
          {!forgotMode ? (
            <>
              <div>
                <h1 className="font-serif text-3xl font-medium text-white">
                  Sign In to CMS Portal
                </h1>
                <p className="text-xs text-white/60 mt-1">
                  Manage pages, homepage layout, projects, services, gallery, and enquiries.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-navy-950 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-white/80">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-[11px] text-gold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-navy-950 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D4A853] to-[#E2BC6B] hover:from-[#E2BC6B] hover:to-[#D4A853] text-navy-950 font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick RBAC Role Switcher for Testing */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                  Quick Role Credential Selector (Password: Admin@123456)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_ROLES.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setEmail(item.email);
                        setPassword('Admin@123456');
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        email === item.email
                          ? 'bg-gold/20 border-gold text-gold font-semibold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {item.role}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <h2 className="font-serif text-2xl text-white">Reset Administrator Password</h2>
              <p className="text-xs text-white/65">
                Enter your registered staff email to generate a secure password reset token.
              </p>
              {forgotSent && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotSent}</span>
                </div>
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-950 border border-white/20 rounded-xl px-4 py-3 text-sm text-white"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setForgotSent('');
                  }}
                  className="flex-1 border border-white/20 rounded-xl py-2.5 text-xs text-white"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold text-navy-950 font-semibold rounded-xl py-2.5 text-xs"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-white/60 hover:text-gold">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </main>
  );
}
