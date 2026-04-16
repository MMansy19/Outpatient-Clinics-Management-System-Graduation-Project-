'use client';

import { use, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
// import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Calendar,
  Activity,
  TrendingUp,
  LogOut,
  UserCheck,
  Clock,
  Stethoscope,
  UserRound,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
  Menu,
  Search,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicTable } from '@/components/super-admin/ClinicTable';
import { DoctorTable } from '@/components/super-admin/DoctorTable';
import { PatientTable } from '@/components/super-admin/PatientTable';
import { VisitTable } from '@/components/super-admin/VisitTable';
import { CreateDoctorDialog } from '@/components/super-admin/CreateDoctorDialog';
import { SuperAdminPatientSearch } from '@/components/super-admin/PatientSearch';
import { SuperAdminPatientProfile } from '@/components/super-admin/PatientProfile';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { useQuery } from '@tanstack/react-query';
import { useLogout } from '@/lib/api/queries/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SuperAdminDashboardProps {
  params: Promise<{ locale: string }>;
}

interface StatsItem {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  progress?: number;
  change?: number | null;
}

const EnhancedStatsCard = ({
  stat,
  index,
}: {
  stat: StatsItem;
  index: number;
}) => {
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
      <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/50 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 animate-pulse" />
        </div>

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-2xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
                  {stat.value.toLocaleString()}
                </p>
                {stat.change !== undefined && stat.change !== null && (
                  <span
                    className={`text-xs font-medium flex items-center ${
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {stat.subtitle}
                </p>
              )}
            </div>

            <div
              className={`flex-shrink-0 p-2.5 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon
                className={`w-5 h-5 ${stat.color} group-hover:rotate-12 transition-transform duration-300`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SelectedPatient {
  id: string;
  name: string;
  gender?: number;
  dateOfBirth?: string;
  socialSecurityNumber: string;
  address?: string | null;
  job?: string | null;
}

export default function SuperAdminDashboard({ params }: SuperAdminDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('superAdmin');
  // const router = useRouter();
  const [activeTab, setActiveTab] = useState('clinics');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);

  const { mutate: logout, isPending: loggingOut } = useLogout();

  const { data: clinics, refetch: refetchClinics } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => superAdminApi.getClinics(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    if (clinics && clinics.length > 0 && !selectedClinicId) {
      setSelectedClinicId(clinics[0].id);
    }
  }, [clinics, selectedClinicId]);

  const handleSelectPatient = (patient: SelectedPatient) => {
    setSelectedPatient(patient);
    setShowPatientProfile(true);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setShowPatientProfile(false);
  };

  const { data: doctorsData, refetch: refetchDoctors } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: () => superAdminApi.getDoctors({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: patientsData, refetch: refetchPatients } = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => superAdminApi.getPatients({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: visitsData, refetch: refetchVisits } = useQuery({
    queryKey: ['visits-all'],
    queryFn: () => superAdminApi.getVisits({ page: 1, limit: 10000 }),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Calculate daily and weekly visits
  const { dailyVisits, weeklyVisits } = useMemo(() => {
    const visits = visitsData?.items || [];
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
  }, [visitsData?.items]);

  const refreshAllData = useCallback(() => {
    refetchClinics();
    refetchDoctors();
    refetchPatients();
    refetchVisits();
  }, [refetchClinics, refetchDoctors, refetchPatients, refetchVisits]);

  useEffect(() => {
    refreshAllData();
  }, [activeTab, refreshAllData]);

  const stats = useMemo(
    () => [
      {
        label: t('totalClinics'),
        value: clinics?.length || 0,
        subtitle: `${clinics?.length || 0} ${t('activeClinicsSuffix')}`,
        icon: Building2,
        color: 'text-medical-primary',
        bgColor: 'bg-medical-primary/10',
        progress: Math.min(((clinics?.length || 0) / 50) * 100, 100),
      },
      {
        label: t('totalDoctors'),
        value: doctorsData?.items?.length || 0,
        subtitle: `${doctorsData?.items?.filter((d) => d.isApproved).length || 0} ${t('approvedSuffix')}`,
        icon: UserCheck,
        color: 'text-medical-secondary',
        bgColor: 'bg-medical-secondary/10',
        progress: doctorsData?.items?.length
          ? (doctorsData?.items?.filter((d) => d.isApproved).length /
              doctorsData?.items?.length) *
            100
          : 0,
      },
      {
        label: t('totalPatients'),
        value: patientsData?.totalItems || 0,
        subtitle: t('totalRegisteredPatients'),
        icon: Users,
        color: 'text-medical-info',
        bgColor: 'bg-medical-info/10',
        progress: Math.min(((patientsData?.totalItems || 0) / 5000) * 100, 100),
      },
      {
        label: t('totalVisits'),
        value: visitsData?.totalItems || 0,
        subtitle: t('allAppointmentsRecorded'),
        icon: Calendar,
        color: 'text-medical-success',
        bgColor: 'bg-medical-success/10',
        progress: Math.min(((visitsData?.totalItems || 0) / 1000) * 100, 100),
      },
      {
        label: t('dailyVisits'),
        value: dailyVisits,
        subtitle: t('appointmentsToday'),
        icon: CalendarCheck,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        progress: Math.min((dailyVisits / 200) * 100, 100),
      },
      {
        label: t('weeklyVisits'),
        value: weeklyVisits,
        subtitle: t('last7Days'),
        icon: CalendarDays,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        progress: Math.min((weeklyVisits / 1000) * 100, 100),
      },
      {
        label: t('pendingApprovals'),
        value: doctorsData?.items?.filter((d) => !d.isApproved).length || 0,
        subtitle: t('doctorsAwaitingApproval'),
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        progress: doctorsData?.items?.length
          ? (doctorsData?.items?.filter((d) => !d.isApproved).length /
              doctorsData?.items?.length) *
            100
          : 0,
      },
    ],
    [
      clinics,
      doctorsData,
      patientsData,
      visitsData,
      dailyVisits,
      weeklyVisits,
      t,
    ]
  );

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      await new Promise<void>((resolve) => {
        logout(undefined, {
          onSettled: () => resolve(),
        });
      });

      window.location.replace(`/${locale}/login`);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace(`/${locale}/login`);
    }
  };

  // const managementSections = [
  //   { key: 'clinics', label: t('clinics'), icon: Building2 },
  //   { key: 'doctors', label: t('doctors'), icon: Stethoscope },
  //   { key: 'patients', label: t('patients'), icon: UserRound },
  //   { key: 'visits', label: t('visits'), icon: ClipboardList },
  // ];

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN]} locale={locale}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-medical-primary/10 dark:bg-medical-primary/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-medical-secondary/10 dark:bg-medical-secondary/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              {/* Mobile Header */}
              <div className="flex items-start justify-between gap-3 md:hidden">
                <div className="flex-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-medical-primary via-medical-secondary to-medical-info bg-clip-text text-transparent mb-1">
                    {t('dashboard')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {t('dashboardSubtitle')}
                  </p>
                </div>

                {/* Mobile Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 space-y-2">
                      <CreateDoctorDialog />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="flex items-center gap-2 p-2">
                      <LanguageToggle
                        locale={locale}
                        variant="outline"
                        size="icon"
                      />
                      <ThemeToggle />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {loggingOut ? t('loggingOut') : t('logOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:flex md:flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-medical-primary via-medical-secondary to-medical-info bg-clip-text text-transparent mb-2">
                    {t('dashboard')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {t('dashboardSubtitle')}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <CreateDoctorDialog />
                  <LanguageToggle
                    locale={locale}
                    variant="outline"
                    size="icon"
                  />
                  <ThemeToggle />
                  <Button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    variant="outline"
                    className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline font-medium">
                      {loggingOut ? t('loggingOut') : t('logOut')}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-medical-primary" />
                <h2 className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {t('systemManagement')}
                </h2>
              </div>
              <Button
                onClick={refreshAllData}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2 md:px-3"
              >
                <Activity className="w-3 h-3 md:mr-2" />
                <span className="hidden md:inline">{t('refresh')}</span>
              </Button>
            </div>

            {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <EnhancedStatsCard key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>

          {/* Management Section - Mobile Optimized */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <h2 className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                {t('quickManagement')}
              </h2>

              {/* Mobile Dropdown for Navigation */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto border-medical-primary text-medical-primary hover:bg-medical-primary/10 h-9"
                  >
                    <span className="mr-2 text-xs md:text-sm">
                      {t('navigateTo')}
                    </span>
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 md:w-48">
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
              </DropdownMenu> */}
            </div>

            {/* Tabs - Mobile Optimized */}
            
            {/* Clinic Selection for Medical Data */}
            {showPatientProfile && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-medical-primary" />
                    <span className="font-medium">{t('selectClinic')}</span>
                  </div>
                  <Select
                    value={selectedClinicId}
                    onValueChange={setSelectedClinicId}
                    disabled={!clinics || clinics.length === 0}
                  >
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue placeholder={t('selectClinicToManage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics?.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                if (value !== 'patient-profile') {
                  setShowPatientProfile(false);
                  setSelectedPatient(null);
                }
              }}
              className="space-y-4"
            >
              {/* Mobile: Scrollable tabs */}
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-6 h-auto md:h-10">
                  <TabsTrigger
                    value="clinics"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                  >
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('clinics')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="search"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                  >
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('searchPatients')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="patient-profile"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                    disabled={!showPatientProfile || !selectedPatient}
                  >
                    <UserRound className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('patientProfile')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="doctors"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                  >
                    <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('doctors')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="patients"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('patients')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="visits"
                    className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-medical-primary data-[state=active]:text-white"
                  >
                    <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('visits')}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="clinics" className="space-y-4 mt-4">
                <ClinicTable />
              </TabsContent>

              <TabsContent value="search" className="space-y-4 mt-4">
                <SuperAdminPatientSearch onSelectPatient={handleSelectPatient} />
              </TabsContent>

              <TabsContent value="patient-profile" className="space-y-4 mt-4">
                {selectedPatient && selectedClinicId && (
                  <SuperAdminPatientProfile
                    patientId={selectedPatient.id}
                    onBack={handleBackToList}
                    selectedClinicId={selectedClinicId}
                  />
                )}
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

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </AuthGuard>
  );
}
