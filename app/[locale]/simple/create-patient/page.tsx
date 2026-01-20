'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit,
  Check,
  ChevronRight,
  Sparkles,
  Droplet,
  AlertCircle,
} from 'lucide-react';

type Gender = 'male' | 'female';
type BloodType = '' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface PatientData {
  name: string;
  nationalId: string;
  birthDate: string;
  address: string;
  phone: string;
  gender: Gender;
  bloodType: BloodType;
  job: string;
}

export default function CreatePatientPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    name: 'Ahmed Mohamed Hassan',
    nationalId: '29512011234567',
    birthDate: '1995-01-12',
    address: 'Cairo, Egypt',
    phone: '',
    gender: 'male',
    bloodType: '',
    job: '',
  });

  const handleSave = async () => {
    setSaving(true);

    // TODO: Replace with actual API call
    // await authApi.createPatient({
    //   firstName: patientData.name.split(' ')[0],
    //   lastName: patientData.name.split(' ').slice(1).join(' '),
    //   socialSecurityNumber: patientData.nationalId,
    //   address: patientData.address,
    //   job: patientData.job,
    //   language: 1,
    // });

    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/patient-profile');
      }, 1500);
    }, 1500);
  };

  const updateField = (field: keyof PatientData, value: string) => {
    setPatientData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    patientData.name && patientData.nationalId && patientData.birthDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/scan-id"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">New Patient</h1>
                <p className="text-sm text-gray-600">Step 2 of 2</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1 text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {editing ? (
                <>
                  <Check className="w-4 h-4" />
                  Done
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <div className="space-y-4">
          {/* Guide Card */}
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-5 text-white animate-slide-down">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Review Extracted Data</h3>
                <p className="text-sm text-blue-100">
                  Verify the information and add any missing details
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Data Section */}
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Extracted Data
              </h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                AI Verified
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={patientData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID
                </label>
                <input
                  type="text"
                  value={patientData.nationalId}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={patientData.birthDate}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                      disabled={!editing}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={patientData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-900 appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={patientData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-slide-up animation-delay-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+20 123 456 7890"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={patientData.job}
                  onChange={(e) => updateField('job', e.target.value)}
                  placeholder="Engineer, Teacher, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type (Optional)
                </label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={patientData.bloodType}
                    onChange={(e) =>
                      updateField('bloodType', e.target.value as BloodType)
                    }
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group animate-slide-up animation-delay-400"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Patient Profile...
              </>
            ) : showSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Patient Created!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Patient Profile
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
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
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
