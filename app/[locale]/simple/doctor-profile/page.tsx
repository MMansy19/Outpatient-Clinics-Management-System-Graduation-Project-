'use client';
import React, { useState, ChangeEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  CreditCard,
  Edit,
  Save,
  LogOut,
  Check,
} from 'lucide-react';

interface DoctorData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  license: string;
  clinic: string;
}

type PageRoute = 'doctor-dashboard' | 'scan-id' | 'search-patients' | 'login';

export default function DoctorProfile() {
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [doctorData, setDoctorData] = useState<DoctorData>({
    name: 'Dr. Ahmed Mohamed',
    email: 'ahmed@hospital.com',
    phone: '+20 123 456 7890',
    specialization: 'Cardiology',
    license: 'MD-123456',
    clinic: 'Clinic 1',
  });

  const updateField = (field: keyof DoctorData, value: string): void => {
    setDoctorData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (): void => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
      alert('Profile updated successfully!');
    }, 1500);
  };

  const handleLogout = (): void => {
    if (confirm('Are you sure you want to logout?')) {
      navigateTo('login');
    }
  };

  const navigateTo = (route: PageRoute): void => {
    window.location.hash = route;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof DoctorData
  ): void => {
    updateField(field, e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2"
            >
              {editing ? (
                <>
                  <Check className="w-4 h-4" />
                  Cancel
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
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {doctorData.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {doctorData.specialization}
                </p>
              </div>
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
                    value={doctorData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(e, 'name')
                    }
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={doctorData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(e, 'email')
                    }
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={doctorData.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(e, 'phone')
                    }
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={doctorData.specialization}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(e, 'specialization')
                    }
                    disabled={!editing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={doctorData.license}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Clinic
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={doctorData.clinic}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-blue-600">342</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-emerald-600">58</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button
            onClick={() => navigateTo('doctor-dashboard')}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
          >
            <Building2 className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigateTo('scan-id')}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button
            onClick={() => navigateTo('search-patients')}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
          >
            <Mail className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600">
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
