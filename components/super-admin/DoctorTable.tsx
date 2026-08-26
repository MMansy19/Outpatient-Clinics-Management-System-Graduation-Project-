'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { DoctorResponse } from '@/lib/api/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineEmptyState } from './OfflineEmptyState';
import { CreateDoctorDialog } from './CreateDoctorDialog';

const LIST_PAGE_LIMIT = 10000;

export function DoctorTable({ onRefresh }: { onRefresh?: () => void } = {}) {
  const t = useTranslations('admin');
  const { isOnline } = useNetworkStatus();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: () => superAdminApi.getDoctors({ page: 1, limit: LIST_PAGE_LIMIT }),
    networkMode: 'offlineFirst',
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  });

  const refreshList = () => {
    refetch();
    onRefresh?.();
  };

  const allDoctors = useMemo<DoctorResponse[]>(() => data?.items ?? [], [data]);
  const totalItems = allDoctors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const doctors = useMemo(
    () => allDoctors.slice((page - 1) * limit, page * limit),
    [allDoctors, page]
  );

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const renderDoctorCard = (doctor: DoctorResponse) => (
    <div
      key={doctor.id}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {doctor.user.firstName} {doctor.user.lastName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {doctor.speciality}
          </p>
        </div>
        <Badge
          variant={doctor.isApproved ? 'default' : 'secondary'}
          className={
            doctor.isApproved
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }
        >
          {doctor.isApproved ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> {t('approved')}</>
          ) : (
            <><Clock className="h-3 w-3 mr-1" /> {t('pending')}</>
          )}
        </Badge>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-medical-primary flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 truncate">{doctor.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-medical-secondary flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400">{doctor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-medical-info flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400">{doctor.user.socialSecurityNumber}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading && !data) {
    if (!isOnline) {
      return <OfflineEmptyState label={t('doctors') ?? 'doctors'} />;
    }
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">{t('loadingDoctors')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Register Doctor Button (Desktop and Mobile) */}
      <div className="flex justify-end">
        <CreateDoctorDialog onSuccess={refreshList} />
      </div>
      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {doctors.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t('noDoctors')}</p>
          </div>
        ) : (
          doctors.map((doctor) => renderDoctorCard(doctor))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">{t('name')}</TableHead>
                <TableHead className="font-semibold">{t('email')}</TableHead>
                <TableHead className="font-semibold">{t('phone')}</TableHead>
                <TableHead className="font-semibold">{t('speciality')}</TableHead>
                <TableHead className="font-semibold">{t('nationalId')}</TableHead>
                <TableHead className="font-semibold">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t('noDoctors')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <TableCell className="font-medium">
                      {doctor.user.firstName} {doctor.user.lastName}
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone}</TableCell>
                    <TableCell>{doctor.speciality}</TableCell>
                    <TableCell>{doctor.user.socialSecurityNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={doctor.isApproved ? 'default' : 'secondary'}
                        className={
                          doctor.isApproved
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }
                      >
                        {doctor.isApproved ? t('approved') : t('pending')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {t('showing')} {doctors.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
          {Math.min(page * limit, totalItems)} {t('of')} {totalItems} {t('doctors')}
        </p>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 1} className="h-9">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('previous')}</span>
          </Button>
          <div className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-md">
            {page} / {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages} className="h-9">
            <span className="hidden sm:inline mr-1">{t('next')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}