'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Activity,
  Stethoscope,
  Shield,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'role' | 'credentials'>('role');

  const handleRoleSelect = (selectedRole: 'doctor' | 'admin') => {
    setRole(selectedRole);
    setTimeout(() => setStep('credentials'), 300);
  };

  const handleLogin = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') {
        router.push('./simple/admin-dashboard');
      } else {
        router.push('./simple/doctor-dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 animate-slide-up">
          {step === 'role' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Choose Your Role
                </h2>
                <p className="text-gray-600 text-sm">
                  Select how you'll access the system
                </p>
              </div>

              <button
                onClick={() => handleRoleSelect('doctor')}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-lg">Doctor</p>
                    <p className="text-sm text-gray-600">
                      Manage patients & visits
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-lg">
                      Administrator
                    </p>
                    <p className="text-sm text-gray-600">
                      System & clinic management
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <div className="pt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Credentials Form */
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      role === 'doctor' ? 'bg-blue-100' : 'bg-emerald-100'
                    }`}
                  >
                    {role === 'doctor' ? (
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Shield className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Signing in as</p>
                    <p className="font-bold text-gray-900 capitalize">{role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('role')}
                  className="text-sm text-blue-600 font-medium hover:underline"
                  type="button"
                >
                  Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder={
                      role === 'admin'
                        ? 'admin@hospital.com'
                        : 'doctor@hospital.com'
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
