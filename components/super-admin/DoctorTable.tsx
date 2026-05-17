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
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { DoctorResponse } from '@/lib/api/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type DoctorFilter = 'active' | 'all' | 'deleted';

export function DoctorTable() {
  const t = useTranslations('admin');
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState<DoctorFilter>('active');
  const limit = 10;

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const filterParams =
        filter === 'all'
          ? { page, limit, includeDeleted: true }
          : filter === 'deleted'
          ? { page, limit, onlyDeleted: true }
          : { page, limit };
      const data = await superAdminApi.getDoctors(filterParams);
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

  useEffect(() => {
    loadDoctors();
  }, [page, filter]);

  const handleDelete = async (id: string) => {
    try {
      await superAdminApi.deleteDoctor(id);
      toast.success(t('doctorDeleted'));
      loadDoctors();
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast.error(t('doctorDeleteError'));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await superAdminApi.restoreDoctor(id);
      toast.success(t('doctorRestored'));
      loadDoctors();
    } catch (error) {
      console.error('Failed to restore doctor:', error);
      toast.error(t('doctorRestoreError'));
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['active', 'all', 'deleted'] as DoctorFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter(f); setPage(1); }}
            className={filter === f ? 'bg-medical-primary hover:bg-medical-primary/90' : ''}
          >
            {t(f === 'active' ? 'showActive' : f === 'all' ? 'showAll' : 'showDeleted')}
          </Button>
        ))}
      </div>
      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {doctors.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t('noDoctors')}</p>
          </div>
        ) : (
          doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                doctor.isDeleted
                  ? 'border-red-200 dark:border-red-900/50 opacity-70'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
            >
              {/* Header with name and status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {doctor.user.firstName} {doctor.user.lastName}
                      </h3>
                      {doctor.isDeleted && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {t('deletedBadge')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{doctor.speciality}</p>
                  </div>
                </div>
                {!doctor.isDeleted && (
                  <Badge
                    variant={doctor.isApproved ? 'default' : 'secondary'}
                    className={`flex-shrink-0 ${
                      doctor.isApproved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {doctor.isApproved ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> {t('approved')}</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> {t('pending')}</>
                    )}
                  </Badge>
                )}
              </div>

              {/* Contact Info */}
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

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                {doctor.isDeleted ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t('restore')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmRestore')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('restoreDoctorWarning')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRestore(doctor.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          {t('restore')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteDoctorConfirmation', { name: `${doctor.user.firstName} ${doctor.user.lastName}` })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-red-600 hover:bg-red-700">
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))
        )}
      </div>
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
                <TableHead className="font-semibold">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t('noDoctors')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doctor) => (
                  <TableRow
                    key={doctor.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 ${doctor.isDeleted ? 'opacity-60' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {doctor.user.firstName} {doctor.user.lastName}
                        {doctor.isDeleted && (
                          <Badge variant="destructive" className="text-xs">
                            {t('deletedBadge')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.phone}</TableCell>
                    <TableCell>{doctor.speciality}</TableCell>
                    <TableCell>{doctor.user.socialSecurityNumber}</TableCell>
                    <TableCell>
                      {doctor.isDeleted ? (
                        <Badge variant="destructive" className="text-xs">{t('deletedBadge')}</Badge>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.isDeleted ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('confirmRestore')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('restoreDoctorWarning')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRestore(doctor.id)} className="bg-emerald-600 hover:bg-emerald-700">
                                {t('restore')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('deleteDoctorConfirmation', { name: `${doctor.user.firstName} ${doctor.user.lastName}` })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-red-600 hover:bg-red-700">
                                {t('delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
          {Math.min(page * limit, totalItems)} {t('of')} {totalItems}{' '}
          {t('doctors')}
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
