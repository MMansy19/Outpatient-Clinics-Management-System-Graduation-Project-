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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api/admin.service';
import type { DoctorResponse } from '@/lib/api/types';
import { toast } from 'sonner';

export function DoctorTable() {
  const t = useTranslations('admin');
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getDoctors({ page, limit });
        setDoctors(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } catch (error) {
        console.error('Failed to load doctors:', error);
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('speciality')}</TableHead>
              <TableHead>{t('nationalId')}</TableHead>
              <TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {t('noDoctors')}
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.id}>
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
                          ? 'bg-medical-success/20 text-medical-success'
                          : 'bg-yellow-500/20 text-yellow-700'
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('showing')} {doctors.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
          {Math.min(page * limit, totalItems)} {t('of')} {totalItems}{' '}
          {t('doctors')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('page')} {page} {t('of')} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            {t('next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
