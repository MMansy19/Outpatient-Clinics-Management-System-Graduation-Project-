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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api/admin.service';
import type { VisitResponse } from '@/lib/api/types';
import { toast } from 'sonner';

interface EnhancedVisit extends VisitResponse {
  patientName?: string;
  doctorName?: string;
}

export function VisitTable() {
  const t = useTranslations('admin');
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
        const data = await adminApi.getVisits({ page, limit });

        // Fetch patient and doctor names for each visit
        const enhancedVisits = await Promise.all(
          data.items.map(async (visit) => {
            try {
              const [patient, doctor] = await Promise.all([
                adminApi.getPatientById(visit.id).catch(() => null),
                adminApi.getDoctorById(visit.id).catch(() => null),
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
              console.error(
                `Failed to fetch names for visit ${visit.id}:`,
                error
              );
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
        console.error('Failed to load visits:', error);
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">{t('visits')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('totalRecords')}: {totalItems}
          </p>
        </div>
      </div>

      <div className="medical-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">
                  {t('patientName')}
                </TableHead>
                <TableHead className="min-w-[150px]">
                  {t('doctorName')}
                </TableHead>
                <TableHead className="min-w-[200px]">
                  {t('diagnoses')}
                </TableHead>
                <TableHead className="min-w-[150px]">
                  {t('createdAt')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {t('noVisitsFound')}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">
                      {visit.patientName || 'Loading...'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {visit.doctorName || 'Loading...'}
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t('page')} {page} {t('of')} {totalPages}
        </p>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('previous')}</span>
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            <span className="hidden sm:inline mr-1">{t('next')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
