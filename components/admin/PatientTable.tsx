'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, MoreHorizontal, Search } from 'lucide-react';
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

import { useGetPatients, useDeletePatient } from '@/lib/api/queries/useUsers';
import { calculateAge } from '@/lib/utils/formatDate';
import { Gender } from '@/types/entities/Patient';

export function PatientTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPatientId, setDeletingPatientId] = useState<number | null>(null);

  const { data: patients, isLoading } = useGetPatients(searchQuery || undefined);
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();

  const handleDelete = (id: number) => {
    deletePatient(id, {
      onSuccess: () => {
        toast.success(t('patientDeleted'));
        setDeletingPatientId(null);
      },
      onError: () => {
        toast.error(t('patientDeleteError'));
      },
    });
  };

  const getGenderLabel = (gender: Gender) => {
    return gender === Gender.MALE ? t('male') : t('female');
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
            placeholder={t('searchPatients')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="medical-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('nationalId')}</TableHead>
              <TableHead>{t('patientName')}</TableHead>
              <TableHead>{t('gender')}</TableHead>
              <TableHead>{t('age')}</TableHead>
              <TableHead>{t('phoneNumber')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('noPatients')}
                </TableCell>
              </TableRow>
            ) : (
              patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">{patient.national_id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <span className={patient.gender === Gender.MALE ? 'medical-badge-info' : 'medical-badge-warning'}>
                      {getGenderLabel(patient.gender)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {calculateAge(patient.birthdate)} {t('years')}
                  </TableCell>
                  <TableCell>{patient.phone_number || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{patient.email || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDeletingPatientId(patient.id)}
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

      <AlertDialog open={!!deletingPatientId} onOpenChange={(open: boolean) => !open && setDeletingPatientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deletePatientWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPatientId && handleDelete(deletingPatientId)}
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
