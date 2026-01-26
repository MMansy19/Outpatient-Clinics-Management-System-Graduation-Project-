'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  TrendingUp,
  CalendarCheck,
  CalendarDays,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { useQuery } from '@tanstack/react-query';
import { useLogout } from '@/lib/api/queries/useAuth';
import { useGetClinicsWithStats } from '@/lib/api/queries/useClinics';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import { adminApi } from '@/lib/api/admin.service';

const StatCard = ({ stat, index, isDark }) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = stat.icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/50 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {typeof stat.value === 'string'
                    ? stat.value
                    : stat.value.toLocaleString()}
                </p>
                {stat.change !== undefined && stat.change !== null && (
                  <span
                    className={`text-xs sm:text-sm font-medium flex items-center ${
                      stat.change > 0 ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 mr-1 ${stat.change < 0 ? 'rotate-180' : ''}`}
                    />
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
            </div>

            <div
              className={`relative p-2 sm:p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClinicCard = ({ clinic, onClick, isDark, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg scale-105'
          : isDark
            ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
            : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`p-2 rounded-lg ${
              isActive
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-emerald-100 to-blue-100'
            }`}
          >
            <Building2
              className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-600'}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${
                isActive
                  ? 'text-white'
                  : isDark
                    ? 'text-gray-200'
                    : 'text-gray-900'
              }`}
            >
              {clinic.name}
            </p>
            <p
              className={`text-xs truncate ${
                isActive
                  ? 'text-white/80'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}
            >
              {clinic.speciality || clinic.department}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform ${
            isActive ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-400'
          }`}
        />
      </div>
    </button>
  );
};

const DynamicArrow = ({ direction = 'right', text, className = '' }) => {
  const Arrow = direction === 'down' ? ArrowDown : ArrowRight;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Arrow className="w-5 h-5 animate-pulse" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('admin');
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const { mutate: logout, isPending: loggingOut } = useLogout();

  // Fetch clinics using the same hook as ClinicTable
  const { data: clinics, isLoading: loadingClinics } = useGetClinicsWithStats();

  const { data: doctorsData, refetch: refetchDoctors } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: () => adminApi.getDoctors({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: patientsData, refetch: refetchPatients } = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => adminApi.getPatients({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: visitsData, refetch: refetchVisits } = useQuery({
    queryKey: ['visits-all'],
    queryFn: () => adminApi.getVisits({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const doctors = doctorsData?.items || [];
  const patients = patientsData?.items || [];
  const visits = visitsData?.items || [];

  // Calculate daily and weekly visits
  const { dailyVisits, weeklyVisits } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const daily = visits.filter((visit) => {
      const visitDate = new Date(visit.createdAt);
      return visitDate >= today;
    }).length;

    const weekly = visits.filter((visit) => {
      const visitDate = new Date(visit.createdAt);
      return visitDate >= weekAgo;
    }).length;

    return { dailyVisits: daily, weeklyVisits: weekly };
  }, [visits]);

  // Calculate clinic-specific stats
  const clinicStats = useMemo(() => {
    if (!selectedClinic) return null;

    const clinicVisits = visits.filter((v) => {
      const doctor = doctors.find((d) => d.id === v.doctorId);
      return doctor?.clinicId === selectedClinic.id;
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyClinicVisits = clinicVisits.filter((v) => {
      const visitDate = new Date(v.createdAt);
      return visitDate >= today;
    }).length;

    const weeklyClinicVisits = clinicVisits.filter((v) => {
      const visitDate = new Date(v.createdAt);
      return visitDate >= weekAgo;
    }).length;

    const clinicDoctors = doctors.filter(
      (d) => d.clinicId === selectedClinic.id
    );

    return {
      dailyVisits: dailyClinicVisits,
      weeklyVisits: weeklyClinicVisits,
      totalDoctors: clinicDoctors.length,
      approvedDoctors: clinicDoctors.filter((d) => d.isApproved).length,
    };
  }, [selectedClinic, visits, doctors]);

  const stats = useMemo(
    () => [
      {
        label: t('totalClinics'),
        value: clinics?.length || 0,
        icon: Building2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
      },
      {
        label: t('totalDoctors'),
        value: doctors.length || 0,
        icon: Stethoscope,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        label: t('totalPatients'),
        value: patientsData?.totalItems || 0,
        icon: UserRound,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        label: 'Daily Visits',
        value: dailyVisits,
        icon: CalendarCheck,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
      {
        label: 'Weekly Visits',
        value: weeklyVisits,
        icon: CalendarDays,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
      },
      {
        label: 'System Health',
        value: '99.9%',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
    ],
    [clinics, doctors, patientsData, dailyVisits, weeklyVisits, t]
  );

  const handleRefresh = () => {
    refetchClinics();
    refetchDoctors();
    refetchPatients();
    refetchVisits();
  };

  const handleClinicClick = (clinic) => {
    setSelectedClinic(clinic);
    setIsSidebarOpen(false);
    setShowWelcome(false);
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push(`/${locale}/login`);
      },
    });
  };

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Detect dark mode from system
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);
  }, []);

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} locale={locale}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark
            ? 'bg-gray-900'
            : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50'
        }`}
      >
        {/* Header */}
        <header
          className={`sticky top-0 z-50 border-b backdrop-blur-lg ${
            isDark
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95 border-gray-200'
          }`}
        >
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`p-2 rounded-lg lg:hidden ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {t('dashboard')}
                  </h1>
                  <p
                    className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {t('dashboardSubtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block">
                  <CreateDoctorDialog />
                </div>

                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? 'bg-gray-700 text-yellow-400'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-80 border-r overflow-y-auto transform transition-transform duration-300 z-40 ${
              isDark
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {t('clinics')}
                </h2>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {clinics?.length || 0}
                </span>
              </div>

              {/* Welcome Guide - Mobile Only */}
              {showWelcome && !selectedClinic && (
                <div className="lg:hidden p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white animate-bounce-gentle">
                  <DynamicArrow
                    direction="down"
                    text="Tap any clinic to view stats"
                    className="text-white"
                  />
                  <p className="text-xs opacity-90 mt-2 ml-7">
                    Get detailed performance metrics
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {loadingClinics ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p
                      className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Loading clinics...
                    </p>
                  </div>
                ) : !clinics || clinics.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2
                      className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
                    />
                    <p
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      No clinics found
                    </p>
                  </div>
                ) : (
                  clinics.map((clinic) => (
                    <ClinicCard
                      key={clinic.id}
                      clinic={clinic}
                      onClick={() => handleClinicClick(clinic)}
                      isDark={isDark}
                      isActive={selectedClinic?.id === clinic.id}
                    />
                  ))
                )}
              </div>

              {/* Mobile Create Doctor Button */}
              <div className="lg:hidden pt-4">
                <CreateDoctorDialog
                  trigger={
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all">
                      <UserPlus className="w-5 h-5" />
                      <span className="font-medium">Create New Doctor</span>
                    </button>
                  }
                />
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {!selectedClinic ? (
              // Overview Stats
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      System Overview
                    </h2>
                    <p
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Real-time statistics across all clinics
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className={`p-2 rounded-lg hover:scale-110 transition-transform ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Next Step Guide - Mobile */}
                {!selectedClinic && (
                  <div className="lg:hidden p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                    <DynamicArrow
                      direction="right"
                      text="Next: Choose a clinic"
                      className="text-white"
                    />
                    <p className="text-sm opacity-90 mt-2 ml-7">
                      Open sidebar and select a clinic for detailed metrics
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {stats.map((stat, index) => (
                    <StatCard
                      key={index}
                      stat={stat}
                      index={index}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Clinic Details
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedClinic(null)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <h2
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {selectedClinic.name}
                    </h2>
                    <p
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {selectedClinic.speciality || selectedClinic.department}
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className={`p-2 rounded-lg hover:scale-110 transition-transform ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Action Guide - Mobile */}
                <div className="lg:hidden p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white">
                  <DynamicArrow
                    direction="down"
                    text="View clinic statistics below"
                    className="text-white"
                  />
                </div>

                {/* Clinic-specific stats */}
                {clinicStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <StatCard
                      stat={{
                        label: 'Daily Visits',
                        value: clinicStats.dailyVisits,
                        icon: CalendarCheck,
                        color: 'text-emerald-600',
                        bgColor: 'bg-emerald-100',
                      }}
                      index={0}
                      isDark={isDark}
                    />
                    <StatCard
                      stat={{
                        label: 'Weekly Visits',
                        value: clinicStats.weeklyVisits,
                        icon: CalendarDays,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-100',
                      }}
                      index={1}
                      isDark={isDark}
                    />
                    <StatCard
                      stat={{
                        label: 'Total Doctors',
                        value: clinicStats.totalDoctors,
                        icon: Stethoscope,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-100',
                      }}
                      index={2}
                      isDark={isDark}
                    />
                    <StatCard
                      stat={{
                        label: 'Approved Doctors',
                        value: clinicStats.approvedDoctors,
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-100',
                      }}
                      index={3}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <style jsx>{`
          @keyframes bounce-gentle {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          .animate-bounce-gentle {
            animation: bounce-gentle 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
