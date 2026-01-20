'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  CreditCard,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Stethoscope,
  Shield,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  specialization: string;
  license: string;
  clinic: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    specialization: '',
    license: '',
    clinic: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/login');
    }, 1500);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep2 = formData.name && formData.email && formData.password;
  const canProceedStep3 =
    role === 'doctor'
      ? formData.phone && formData.specialization && formData.license
      : formData.phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to login</span>
        </Link>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step >= s ? 'bg-white w-8' : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 animate-slide-up">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Role
                </h2>
                <p className="text-gray-600 text-sm">
                  Select how you'll use CodeBlue
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setRole('doctor')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    role === 'doctor'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role === 'doctor' ? 'bg-blue-600' : 'bg-gray-100'
                      }`}
                    >
                      <Stethoscope
                        className={`w-6 h-6 ${role === 'doctor' ? 'text-white' : 'text-gray-600'}`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Doctor</p>
                      <p className="text-sm text-gray-600">
                        Scan IDs & manage patients
                      </p>
                    </div>
                    {role === 'doctor' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setRole('admin')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    role === 'admin'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role === 'admin' ? 'bg-blue-600' : 'bg-gray-100'
                      }`}
                    >
                      <Shield
                        className={`w-6 h-6 ${role === 'admin' ? 'text-white' : 'text-gray-600'}`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        Administrator
                      </p>
                      <p className="text-sm text-gray-600">
                        Manage users & system
                      </p>
                    </div>
                    {role === 'admin' && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                type="button"
              >
                Continue
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account Details
                </h2>
                <p className="text-gray-600 text-sm">Set up your credentials</p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Dr. Ahmed Mohamed"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="doctor@hospital.com"
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  type="button"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  type="button"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Professional Info */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {role === 'doctor' ? 'Professional Info' : 'Contact Info'}
                </h2>
                <p className="text-gray-600 text-sm">Final step to complete</p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+20 123 456 7890"
                  />
                </div>
              </div>

              {role === 'doctor' && (
                <>
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Specialization
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="specialization"
                        type="text"
                        value={formData.specialization}
                        onChange={(e) =>
                          handleInputChange('specialization', e.target.value)
                        }
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Cardiology"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="license"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      License Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="license"
                        type="text"
                        value={formData.license}
                        onChange={(e) =>
                          handleInputChange('license', e.target.value)
                        }
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="MD-123456"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="clinic"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Assigned Clinic
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="clinic"
                        value={formData.clinic}
                        onChange={(e) =>
                          handleInputChange('clinic', e.target.value)
                        }
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                      >
                        <option value="">Select Clinic</option>
                        {Array.from({ length: 50 }, (_, i) => (
                          <option key={i + 1} value={`clinic-${i + 1}`}>
                            Clinic {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  type="button"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canProceedStep3}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="button"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
