'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  User,
  Stethoscope,
  FileText,
  Calendar,
} from 'lucide-react';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { SuperAdminVisitItem } from '@/lib/api/types';
import { toast } from 'sonner';

interface EnhancedVisit extends SuperAdminVisitItem {
  patientName?: string;
  doctorName?: string;
}

export function VisitTable() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [visits, setVisits] = useState<EnhancedVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const data = await superAdminApi.getVisits({ page, limit });

        const enhancedVisits = await Promise.all(
          data.items.map(async (visit) => {
            try {
              const [patient, doctor] = await Promise.all([
                superAdminApi
                  .getPatientById(visit.patient.id)
                  .catch(() => null),
                superAdminApi.getDoctorById(visit.doctor.id).catch(() => null),
              ]);

              return {
                ...visit,
                patientName: patient
                  ? `${patient.firstName} ${patient.lastName}`
                  : 'Unknown Patient',
                doctorName: doctor
                  ? `${doctor.firstName} ${doctor.lastName}`
                  : 'Unknown Doctor',
              };
            } catch (error) {
              return {
                ...visit,
                patientName: 'Unknown Patient',
                doctorName: 'Unknown Doctor',
              };
            }
          })
        );

        setVisits(enhancedVisits);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } catch (error) {
        toast.error('Failed to load visits');
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('visits')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('totalRecords')}:{' '}
            <span className="font-semibold">{totalItems}</span>
          </p>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {visits.length === 0 ? (
          <div className="text-center py-12 px-4">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t('noVisitsFound')}</p>
          </div>
        ) : (
          visits.map((visit, index) => (
            <div
              key={visit.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(visit.createdAt)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {t('visitNumber')}
                    {visit.id.slice(0, 8)}
                  </h3>
                </div>
              </div>

              {/* People Info */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('patientName')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {visit.patientName || tCommon('loading')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('doctorName')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {visit.doctorName || tCommon('loading')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnoses */}
              {visit.diagnoses && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-medical-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('diagnoses')}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                        {visit.diagnoses || t('noDiagnoses')}{' '}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">
                  {t('patientName')}
                </TableHead>
                <TableHead className="font-semibold">
                  {t('doctorName')}
                </TableHead>
                <TableHead className="font-semibold">
                  {t('diagnoses')}
                </TableHead>
                <TableHead className="font-semibold">
                  {t('createdAt')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      {t('noVisitsFound')}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow
                    key={visit.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <TableCell className="font-medium">
                      {visit.patientName || tCommon('loading')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {visit.doctorName || tCommon('loading')}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={visit.diagnoses}>
                        {visit.diagnoses}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(visit.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {t('page')} {page} {t('of')} {totalPages} • {totalItems} total visits
        </p>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 1}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('previous')}</span>
          </Button>
          <div className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-md">
            {page} / {totalPages}
          </div>
          <Button
            onClick={handleNextPage}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <span className="hidden sm:inline mr-1">{t('next')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
