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
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { adminApi } from '@/lib/api/admin.service';
import type { PatientResponse } from '@/lib/api/types';
import { toast } from 'sonner';
import { EditPatientDialog } from './EditPatientDialog';

export function PatientTable() {
  const t = useTranslations('admin');
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    loadPatients();
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

  const handleEditPatient = (patient: PatientResponse) => {
    setEditingPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Reload patients after successful edit
    loadPatients();
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPatients({ page, limit });
      setPatients(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading patients...</p>
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
              <TableHead>{t('nationalId')}</TableHead>
              <TableHead>{t('dateOfBirth')}</TableHead>
              <TableHead>{t('gender')}</TableHead>
              <TableHead>{t('job')}</TableHead>
              <TableHead>{t('address')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t('noPatients')}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.user.firstName} {patient.user.lastName}
                  </TableCell>
                  <TableCell>{patient.user.socialSecurityNumber}</TableCell>
                  <TableCell>{formatDate(patient.user.dateOfBirth)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.user.gender}</Badge>
                  </TableCell>
                  <TableCell>{patient.job}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {patient.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </Button>
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
          {t('showing')} {patients.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
          {Math.min(page * limit, totalItems)} {t('of')} {totalItems}{' '}
          {t('patients')}
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
      
      <EditPatientDialog
        patient={editingPatient}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
