'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Building2, Sparkles } from 'lucide-react';
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

import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { ClinicResponse } from '@/lib/api/types';
import { AddClinicDialog } from './AddClinicDialog';

export function ClinicTable() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getClinics();
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
      toast.error('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const filteredClinics = clinics?.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const renderClinicCard = (clinic: ClinicResponse) => (
    <div
      key={clinic.id}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-medical-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-medical-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
            {clinic.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-medical-secondary" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {clinic.speciality}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
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
          <span>{t('addClinic')}</span>
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
          filteredClinics?.map((clinic) => renderClinicCard(clinic))
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClinics?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t('noClinics')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinics?.map((clinic) => (
                  <TableRow key={clinic.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <TableCell className="font-medium">{clinic.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-medical-secondary" />
                        <span>{clinic.speciality}</span>
                      </div>
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

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
