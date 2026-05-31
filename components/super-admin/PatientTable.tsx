'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Pencil,
  User,
  CreditCard,
  Calendar,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { superAdminApi } from '@/lib/api/superAdmin.service';
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
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const limit = 10;

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getPatients({ page, limit });
      setPatients(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

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

  const handleEditSuccess = useCallback(() => {
    loadPatients();
  }, [loadPatients]);

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {patients.length === 0 ? (
          <div className="text-center py-12 px-4">
            <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t('noPatients')}</p>
          </div>
        ) : (
          patients.map((patient, index) => (
            <div
              key={patient.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              {/* Header with name and edit button */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {patient.user.firstName} {patient.user.lastName}
                    </h3>
                    {/* <Badge variant="outline" className="mt-1 text-xs">
                      {patient.user.gender}
                    </Badge> */}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPatient(patient)}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {/* Patient Details */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-medical-primary flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-500 min-w-[60px]">
                    {t('nationalId')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {patient.user.socialSecurityNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-medical-secondary flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-500 min-w-[60px]">
                    {t('dateOfBirth')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatDate(patient.user.dateOfBirth)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-medical-info flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-500 min-w-[60px]">
                    {t('job')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {patient.job || '-'}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-medical-success flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 dark:text-gray-500 min-w-[60px]">
                    {t('address')}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                    {patient.address || '-'}
                  </span>
                </div>
              </div>
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
                <TableHead className="font-semibold">{t('name')}</TableHead>
                <TableHead className="font-semibold">
                  {t('nationalId')}
                </TableHead>
                <TableHead className="font-semibold">
                  {t('dateOfBirth')}
                </TableHead>
                <TableHead className="font-semibold">{t('gender')}</TableHead>
                <TableHead className="font-semibold">{t('job')}</TableHead>
                <TableHead className="font-semibold">{t('address')}</TableHead>
                <TableHead className="text-right font-semibold">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t('noPatients')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <TableCell className="font-medium">
                      {patient.user.firstName} {patient.user.lastName}
                    </TableCell>
                    <TableCell>{patient.user.socialSecurityNumber}</TableCell>
                    <TableCell>
                      {formatDate(patient.user.dateOfBirth)}
                    </TableCell>
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {t('showing')} {patients.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
          {Math.min(page * limit, totalItems)} {t('of')} {totalItems}{' '}
          {t('patients')}
        </p>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('previous')}</span>
          </Button>
          <div className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-md">
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="h-9"
          >
            <span className="hidden sm:inline mr-1">{t('next')}</span>
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
