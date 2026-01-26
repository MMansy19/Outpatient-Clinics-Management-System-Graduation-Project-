'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Calendar,
  Activity,
  TrendingUp,
  LogOut,
  UserCheck,
  Clock,
  ChevronDown,
  Stethoscope,
  UserRound,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { DoctorTable } from '@/components/admin/DoctorTable';
import { PatientTable } from '@/components/admin/PatientTable';
import { VisitTable } from '@/components/admin/VisitTable';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import { adminApi } from '@/lib/api/admin.service';
import { useQuery } from '@tanstack/react-query';
import { useLogout } from '@/lib/api/queries/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

// Enhanced Stats Card Component
const EnhancedStatsCard = ({ stat, index }: { stat: any; index: number }) => {
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
      <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/50 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 animate-pulse" />
        </div>

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
                  {stat.value.toLocaleString()}
                </p>
                {stat.change !== undefined && stat.change !== null && (
                  <span
                    className={`text-sm font-medium flex items-center ${
                      stat.change > 0
                        ? 'text-medical-success'
                        : stat.change < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {stat.change !== 0 && (
                      <TrendingUp
                        className={`w-3 h-3 mr-1 ${stat.change < 0 ? 'rotate-180' : ''}`}
                      />
                    )}
                    {stat.change === 0 ? '0%' : `${Math.abs(stat.change)}%`}
                  </span>
                )}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.subtitle}
                </p>
              )}
            </div>

            <div
              className={`relative p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <Icon
                className={`w-6 h-6 ${stat.color} relative z-10 group-hover:rotate-12 transition-transform duration-300`}
              />
            </div>
          </div>

          {/* {stat.progress !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(stat.progress)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.color.replace('text-', 'bg-')}`}
                  style={{ width: isVisible ? `${stat.progress}%` : '0%' }}
                />
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

// Logout Button Component
const LogoutButton = ({
  onLogout,
  loading,
}: {
  onLogout: () => void;
  loading: boolean;
}) => (
  <button
    onClick={onLogout}
    disabled={loading}
    className="group relative flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 border border-red-200 dark:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
    <span className="font-medium text-sm relative z-10">
      {loading ? 'Logging out...' : 'Logout'}
    </span>
  </button>
);

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('admin');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('clinics');

  // Use the logout hook
  const { mutate: logout, isPending: loggingOut } = useLogout();

  // Fetch real data with auto-refetch
  const { data: clinics, refetch: refetchClinics } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => adminApi.getClinics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

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

  // Extract data safely
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

  // Refetch all data when tab changes or on manual trigger
  const refreshAllData = () => {
    refetchClinics();
    refetchDoctors();
    refetchPatients();
    refetchVisits();
  };

  // Auto-refresh on tab change
  useEffect(() => {
    refreshAllData();
  }, [activeTab]);

  // Calculate stats from real data
  const stats = useMemo(
    () => [
      {
        label: t('totalClinics'),
        value: clinics?.length || 0,
        subtitle: `${clinics?.length || 0} active clinics`,
        icon: Building2,
        color: 'text-medical-primary',
        bgColor: 'bg-medical-primary/10',
        progress: Math.min(((clinics?.length || 0) / 50) * 100, 100),
      },
      {
        label: t('totalDoctors'),
        value: doctors.length || 0,
        subtitle: `${doctors.filter((d) => d.isApproved).length || 0} approved`,
        icon: UserCheck,
        color: 'text-medical-secondary',
        bgColor: 'bg-medical-secondary/10',
        progress: doctors.length
          ? (doctors.filter((d) => d.isApproved).length / doctors.length) * 100
          : 0,
      },
      {
        label: t('totalPatients'),
        value: patientsData?.totalItems || 0,
        subtitle: `Total registered patients`,
        icon: Users,
        color: 'text-medical-info',
        bgColor: 'bg-medical-info/10',
        progress: Math.min(((patientsData?.totalItems || 0) / 5000) * 100, 100),
      },
      {
        label: 'Total Visits',
        value: visitsData?.totalItems || 0,
        subtitle: `All appointments recorded`,
        icon: Calendar,
        color: 'text-medical-success',
        bgColor: 'bg-medical-success/10',
        progress: Math.min(((visitsData?.totalItems || 0) / 1000) * 100, 100),
      },
      {
        label: 'Daily Visits',
        value: dailyVisits,
        subtitle: `Appointments today`,
        icon: CalendarCheck,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        progress: Math.min((dailyVisits / 200) * 100, 100),
      },
      {
        label: 'Weekly Visits',
        value: weeklyVisits,
        subtitle: `Last 7 days`,
        icon: CalendarDays,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        progress: Math.min((weeklyVisits / 1000) * 100, 100),
      },
      {
        label: 'Pending Approvals',
        value: doctors.filter((d) => !d.isApproved).length || 0,
        subtitle: 'Doctors awaiting approval',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        progress: doctors.length
          ? (doctors.filter((d) => !d.isApproved).length / doctors.length) * 100
          : 0,
      },
      {
        label: 'System Health',
        value: 99.9,
        subtitle: 'Last 30 days uptime',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        progress: 99.9,
      },
    ],
    [
      clinics,
      doctors,
      patients,
      patientsData,
      visitsData,
      dailyVisits,
      weeklyVisits,
      t,
    ]
  );

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push(`/${locale}/login`);
      },
      onError: (error) => {
        console.error('Logout failed:', error);
      },
    });
  };

  const managementSections = [
    { key: 'clinics', label: t('clinics'), icon: Building2 },
    { key: 'doctors', label: t('doctors'), icon: Stethoscope },
    { key: 'patients', label: t('patients'), icon: UserRound },
    { key: 'visits', label: t('visits'), icon: ClipboardList },
  ];

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} locale={locale}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-medical-primary/10 dark:bg-medical-primary/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-medical-secondary/10 dark:bg-medical-secondary/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-medical-primary via-medical-secondary to-medical-info bg-clip-text text-transparent mb-2">
                  {t('dashboard')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {t('dashboardSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <CreateDoctorDialog />
                <ThemeToggle />
                <LogoutButton onLogout={handleLogout} loading={loggingOut} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-medical-primary" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {t('systemManagement')}
                </h2>
              </div>
              <Button
                onClick={refreshAllData}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Activity className="w-3 h-3 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <EnhancedStatsCard key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>

          {/* Management Section with Dropdown */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Quick Management
              </h2>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-medical-primary text-medical-primary hover:bg-medical-primary/10"
                  >
                    <span className="mr-2">Navigate to</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {managementSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <DropdownMenuItem
                        key={section.key}
                        onClick={() => setActiveTab(section.key)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {section.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="grid w-full grid-cols-4 min-w-[400px] sm:min-w-0 sm:w-full lg:w-[550px]">
                  <TabsTrigger value="clinics" className="text-xs sm:text-sm">
                    {t('clinics')}
                  </TabsTrigger>
                  <TabsTrigger value="doctors" className="text-xs sm:text-sm">
                    {t('doctors')}
                  </TabsTrigger>
                  <TabsTrigger value="patients" className="text-xs sm:text-sm">
                    {t('patients')}
                  </TabsTrigger>
                  <TabsTrigger value="visits" className="text-xs sm:text-sm">
                    {t('visits')}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="clinics" className="space-y-4 mt-4">
                <ClinicTable />
              </TabsContent>

              <TabsContent value="doctors" className="space-y-4 mt-4">
                <DoctorTable />
              </TabsContent>

              <TabsContent value="patients" className="space-y-4 mt-4">
                <PatientTable />
              </TabsContent>

              <TabsContent value="visits" className="space-y-4 mt-4">
                <VisitTable />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </AuthGuard>
  );
}
