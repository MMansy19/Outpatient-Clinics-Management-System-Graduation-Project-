'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { adminApi } from '@/lib/api/admin.service';
import type { ClinicResponse } from '@/lib/api/types';
import { AddClinicDialog } from './AddClinicDialog';
// import { EditClinicDialog } from './EditClinicDialog';

export function ClinicTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getClinics();
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
      await adminApi.deleteClinic(id);
      toast.success(t('clinicDeleted') || 'Clinic deleted successfully');
      setDeletingClinicId(null);
      loadClinics(); // Reload the clinics list
    } catch (error) {
      console.error('Failed to delete clinic:', error);
      toast.error(t('clinicDeleteError') || 'Failed to delete clinic');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSuccess = () => {
    loadClinics(); // Reload clinics after successful add
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading clinics...</p>
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

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  {t('clinicName')}
                </TableHead>
                <TableHead className="min-w-[150px]">
                  {t('speciality')}
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    {t('noClinics')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinics?.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>{clinic.speciality}</TableCell>
                    <TableCell className="text-right">
                      {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingClinic(clinic)}
                          >
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
                      </DropdownMenu> */}
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
      {/* 
      {editingClinic && (
        <EditClinicDialog
          clinic={editingClinic}
          open={!!editingClinic}
          onOpenChange={(open) => !open && setEditingClinic(null)}
          onSuccess={handleEditSuccess}
        />
      )} */}

      <AlertDialog
        open={!!deletingClinicId}
        onOpenChange={(open) => !open && setDeletingClinicId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteClinicWarning')}
            </AlertDialogDescription>
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
