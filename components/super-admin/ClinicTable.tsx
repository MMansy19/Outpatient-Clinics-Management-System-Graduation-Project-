'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Building2, Sparkles, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { ClinicResponse } from '@/lib/api/types';
import { AddClinicDialog } from './AddClinicDialog';

type ClinicFilter = 'active' | 'all' | 'deleted';

export function ClinicTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ClinicFilter>('active');
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);
  const [restoringClinicId, setRestoringClinicId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadClinics();
  }, [filter]);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const filterParams =
        filter === 'all'
          ? { includeDeleted: true }
          : filter === 'deleted'
          ? { onlyDeleted: true }
          : undefined;
      const data = await superAdminApi.getClinics(filterParams);
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
      toast.error('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics?.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await superAdminApi.deleteClinic(id);
      toast.success(t('clinicDeleted'));
      setDeletingClinicId(null);
      loadClinics();
    } catch (error) {
      console.error('Failed to delete clinic:', error);
      toast.error(t('clinicDeleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setIsRestoring(true);
      await superAdminApi.restoreClinic(id);
      toast.success(t('clinicRestored'));
      setRestoringClinicId(null);
      loadClinics();
    } catch (error) {
      console.error('Failed to restore clinic:', error);
      toast.error(t('clinicRestoreError'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleAddSuccess = () => {
    loadClinics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['active', 'all', 'deleted'] as ClinicFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-medical-primary hover:bg-medical-primary/90' : ''}
          >
            {t(f === 'active' ? 'showActive' : f === 'all' ? 'showAll' : 'showDeleted')}
          </Button>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchClinics')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-medical-primary hover:bg-medical-primary/90 h-11 whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('addClinic')}</span>
          <span className="sm:hidden">{t('addClinic')}</span>
        </Button>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredClinics?.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">{t('noClinics')}</p>
          </div>
        ) : (
          filteredClinics?.map((clinic, index) => (
            <div
              key={clinic.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                clinic.isDeleted
                  ? 'border-red-200 dark:border-red-900/50 opacity-70'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-medical-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-medical-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {clinic.name}
                    </h3>
                    {clinic.isDeleted && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {t('deletedBadge')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-medical-secondary" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {clinic.speciality}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                {clinic.isDeleted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRestoringClinicId(clinic.id)}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {t('restore')}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingClinicId(clinic.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('delete')}
                  </Button>
                )}
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
                <TableHead className="font-semibold">{t('clinicName')}</TableHead>
                <TableHead className="font-semibold">{t('speciality')}</TableHead>
                <TableHead className="font-semibold">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t('noClinics')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinics?.map((clinic) => (
                  <TableRow
                    key={clinic.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 ${
                      clinic.isDeleted ? 'opacity-60' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {clinic.name}
                        {clinic.isDeleted && (
                          <Badge variant="destructive" className="text-xs">
                            {t('deletedBadge')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-medical-secondary" />
                        <span>{clinic.speciality}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {clinic.isDeleted ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoringClinicId(clinic.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingClinicId(clinic.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddClinicDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingClinicId}
        onOpenChange={(open) => !open && setDeletingClinicId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteClinicWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClinicId && handleDelete(deletingClinicId)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog
        open={!!restoringClinicId}
        onOpenChange={(open) => !open && setRestoringClinicId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRestore')}</AlertDialogTitle>
            <AlertDialogDescription>{t('restoreClinicWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoringClinicId && handleRestore(restoringClinicId)}
              disabled={isRestoring}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {t('restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
