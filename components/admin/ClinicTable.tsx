'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, MoreHorizontal, Search } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { useGetClinicsWithStats, useDeleteClinic } from '@/lib/api/queries/useClinics';
import { AddClinicDialog } from './AddClinicDialog';
import { EditClinicDialog } from './EditClinicDialog';
import type { ClinicWithStats } from '@/types/entities/Clinic';

export function ClinicTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClinic, setEditingClinic] = useState<ClinicWithStats | null>(null);
  const [deletingClinicId, setDeletingClinicId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: clinics, isLoading } = useGetClinicsWithStats();
  const { mutate: deleteClinic, isPending: isDeleting } = useDeleteClinic();

  const filteredClinics = clinics?.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    deleteClinic(id, {
      onSuccess: () => {
        toast.success(t('clinicDeleted'));
        setDeletingClinicId(null);
      },
      onError: () => {
        toast.error(t('clinicDeleteError'));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchClinics')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-medical-primary hover:bg-medical-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addClinic')}
        </Button>
      </div>

      <div className="medical-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('clinicName')}</TableHead>
              <TableHead>{t('department')}</TableHead>
              <TableHead>{t('location')}</TableHead>
              <TableHead className="text-center">{t('doctors')}</TableHead>
              <TableHead className="text-center">{t('patients')}</TableHead>
              <TableHead className="text-center">{t('todayVisits')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClinics?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('noClinics')}
                </TableCell>
              </TableRow>
            ) : (
              filteredClinics?.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>{clinic.department}</TableCell>
                  <TableCell>{clinic.location || '-'}</TableCell>
                  <TableCell className="text-center">
                    <span className="medical-badge-stable">{clinic.doctor_count}</span>
                  </TableCell>
                  <TableCell className="text-center">{clinic.patient_count}</TableCell>
                  <TableCell className="text-center">{clinic.today_visits}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingClinic(clinic)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingClinicId(clinic.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddClinicDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingClinic && (
        <EditClinicDialog
          clinic={editingClinic}
          open={!!editingClinic}
          onOpenChange={(open) => !open && setEditingClinic(null)}
        />
      )}

      <AlertDialog open={!!deletingClinicId} onOpenChange={(open) => !open && setDeletingClinicId(null)}>
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
    </div>
  );
}
