'use client';

import React from 'react';
import Link from 'next/link';
import {
  Camera,
  Calendar,
  Clock,
  Users,
  Activity,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Search,
  User,
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const doctorInfo = {
    name: 'Dr. Ahmed Mohamed',
    specialization: 'Cardiology',
    clinic: 'Clinic 1',
  };

  const todayStats = {
    scheduled: 8,
    completed: 5,
    pending: 3,
  };

  const upcomingVisits = [
    {
      id: 1,
      patientName: 'Sara Hassan',
      time: '10:00 AM',
      status: 'scheduled',
    },
    {
      id: 2,
      patientName: 'Mohamed Ali',
      time: '11:30 AM',
      status: 'scheduled',
    },
    {
      id: 3,
      patientName: 'Fatima Ahmed',
      time: '02:00 PM',
      status: 'scheduled',
    },
  ];

  const recentVisits = [
    {
      id: 1,
      patientName: 'Ali Mohamed',
      time: '09:00 AM',
      status: 'completed',
    },
    {
      id: 2,
      patientName: 'Nour Hassan',
      time: '08:30 AM',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {doctorInfo.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {doctorInfo.specialization} • {doctorInfo.clinic}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 animate-slide-up">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.scheduled}
              </p>
              <p className="text-xs text-gray-600">Scheduled</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.completed}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.pending}
              </p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>

          <Link
            href="/simple/scan-id"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all group animate-slide-up animation-delay-200"
          >
            <div className="flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              <span>Scan Patient ID</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Upcoming Visits */}
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up animation-delay-400">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Upcoming Visits
              </h3>
              <span className="text-sm text-blue-600 font-medium">
                {upcomingVisits.length} scheduled
              </span>
            </div>
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {visit.patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {visit.patientName}
                      </p>
                      <p className="text-xs text-gray-600">{visit.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Visits */}
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-slide-up animation-delay-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Visits</h3>
              <span className="text-sm text-emerald-600 font-medium">
                {recentVisits.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {visit.patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {visit.patientName}
                      </p>
                      <p className="text-xs text-gray-600">{visit.time}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link
            href="/simple/doctor-dashboard"
            className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600"
          >
            <Activity className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/simple/scan-id"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Scan</span>
          </Link>
          <Link
            href="/simple/search-patients"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link
            href="/simple/doctor-profile"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>

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
          animation: slide-up 0.5s ease-out;
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
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
