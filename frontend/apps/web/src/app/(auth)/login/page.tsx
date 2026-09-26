'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Building2, HeartPulse, GraduationCap, Landmark, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { UserRole } from '../../../types';
import { useRoleContext } from '../../../hooks/useRoleContext';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useRoleContext();

  const [email, setEmail] = useState('admin@credlink.network');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('HOSPITAL');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid organization email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      switchRole(selectedRole);
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const domainOptions: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'HOSPITAL',
      title: 'Healthcare Provider',
      desc: 'Issue & verify immunization & insurance credentials',
      icon: <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    },
    {
      role: 'COLLEGE',
      title: 'College / Education',
      desc: 'Issue degrees & verified academic transcripts',
      icon: <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    },
    {
      role: 'BANK',
      title: 'Bank & Financial',
      desc: 'KYC & income claim selective verification',
      icon: <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    },
    {
      role: 'EMPLOYER',
      title: 'Employer Enterprise',
      desc: 'Issue employment records & verify background claims',
      icon: <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-lg mb-4 shadow-sm">
          CL
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          CredLink Admin Portal
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Unified Citizen-Centric Digital Identity & Verifiable Credential Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-8 px-6 sm:px-8 shadow-sm rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Domain Selection Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Organization Realm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {domainOptions.map((item) => {
                  const isSelected = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`p-2.5 text-left border rounded-lg transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/80 dark:border-slate-100 dark:bg-slate-800/80 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {item.icon}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Field */}
            <Input
              label="Organization Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hospital.org"
              required
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 cursor-not-allowed">Reset Key?</span>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400 rounded-md text-xs">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" isLoading={isLoading} className="w-full h-10 mt-2 gap-2">
              <span>Sign In to {selectedRole} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo notice footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Badge variant="neutral" size="sm" className="text-[10px] uppercase font-mono tracking-wider">
              DEMO MODE — NO REAL CREDENTIAL KEYS EXPOSED
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
