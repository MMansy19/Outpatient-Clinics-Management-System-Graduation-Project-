'use client';

import { useState } from 'react';
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
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAdminGetPatients } from '@/lib/api/queries/useAdmin';

export function AdminPatientsTable() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useAdminGetPatients({ page, limit });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-medical-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('errorLoading')}
      </div>
    );
  }

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('ssn')}</TableHead>
              <TableHead>{t('gender')}</TableHead>
              <TableHead>{t('dateOfBirth')}</TableHead>
              <TableHead>{t('job')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('noPatientsFound')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="font-mono text-xs">{patient.socialSecurityNumber}</TableCell>
                  <TableCell>{patient.gender === 0 ? t('male') : t('female')}</TableCell>
                  <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>{patient.job || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('page')} {page} / {totalPages} ({data?.totalItems || 0} {t('total')})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
