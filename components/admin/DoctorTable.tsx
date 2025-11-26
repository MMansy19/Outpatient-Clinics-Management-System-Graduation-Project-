'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, MoreHorizontal, Search, Filter } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { useGetDoctors, useDeleteDoctor } from '@/lib/api/queries/useUsers';
import { useGetClinics } from '@/lib/api/queries/useClinics';

export function DoctorTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');
  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(null);

  const { data: clinics } = useGetClinics();
  const { data: doctors, isLoading } = useGetDoctors(
    selectedClinicId === 'all' ? undefined : Number(selectedClinicId)
  );
  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();

  const filteredDoctors = doctors?.filter((doctor) =>
    doctor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    deleteDoctor(id, {
      onSuccess: () => {
        toast.success(t('doctorDeleted'));
        setDeletingDoctorId(null);
      },
      onError: () => {
        toast.error(t('doctorDeleteError'));
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
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchDoctors')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('filterByClinic')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allClinics')}</SelectItem>
              {clinics?.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id.toString()}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="medical-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('doctorName')}</TableHead>
              <TableHead>{t('specialization')}</TableHead>
              <TableHead>{t('licenseNumber')}</TableHead>
              <TableHead>{t('clinic')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phoneNumber')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t('noDoctors')}
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors?.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.username}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell className="font-mono text-sm">{doctor.license_number}</TableCell>
                  <TableCell>
                    <span className="medical-badge-info">
                      {doctor.clinic.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doctor.email}</TableCell>
                  <TableCell>{doctor.phone_number}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDeletingDoctorId(doctor.id)}
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

      <AlertDialog open={!!deletingDoctorId} onOpenChange={(open: boolean) => !open && setDeletingDoctorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDoctorWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDoctorId && handleDelete(deletingDoctorId)}
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
