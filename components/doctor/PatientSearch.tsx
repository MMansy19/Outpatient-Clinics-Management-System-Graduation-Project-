'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Calendar, Plus, Filter } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useDebounce } from '@/lib/hooks/useDebounce';
import { useSearchPatients } from '@/lib/api/queries/usePatients';
import { useGetClinics } from '@/lib/api/queries/useClinics';
import { calculateAge } from '@/lib/utils/formatDate';
import { Gender } from '@/types/entities/Patient';
import type { SearchFilters } from '@/types/entities/Visit';

interface PatientSearchProps {
  onSelectPatient: (patientId: number) => void;
  onAddNew: () => void;
}

export function PatientSearch({ onSelectPatient, onAddNew }: PatientSearchProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState<SearchFilters['period']>('today');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: clinics } = useGetClinics();
  const { data: searchResults, isLoading } = useSearchPatients({
    query: debouncedSearch,
    period,
    clinicId: selectedClinicId === 'all' ? undefined : Number(selectedClinicId),
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-primary">{t('patientSearch')}</h2>
          <p className="text-sm text-muted-foreground">{t('searchSubtitle')}</p>
        </div>
        <Button
          onClick={onAddNew}
          className="bg-medical-primary hover:bg-medical-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addNewPatient')}
        </Button>
      </div>

      {/* Search Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: string) => setPeriod(value as SearchFilters['period'])}>
            <SelectTrigger>
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('today')}</SelectItem>
              <SelectItem value="week">{t('thisWeek')}</SelectItem>
              <SelectItem value="month">{t('thisMonth')}</SelectItem>
              <SelectItem value="custom">{t('customRange')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allClinics')}</SelectItem>
              {clinics?.map((clinic: { id: number; name: string }) => (
                <SelectItem key={clinic.id} value={clinic.id.toString()}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        )}

        {!isLoading && searchResults?.patients.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noPatients')}</p>
              <Button variant="outline" onClick={onAddNew} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('addFirstPatient')}
              </Button>
            </CardContent>
          </Card>
        )}

        {searchResults?.patients.map((patient) => (
          <Card
            key={patient.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => onSelectPatient(patient.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{patient.name}</CardTitle>
                  <CardDescription className="truncate">
                    {tPatient('nationalId')}: {patient.national_id}
                  </CardDescription>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {calculateAge(patient.birthdate)} {tPatient('years')}
                  </div>
                  <div className="text-muted-foreground">
                    {patient.gender === Gender.MALE ? tPatient('male') : tPatient('female')}
                  </div>
                </div>
              </div>
            </CardHeader>
            {patient.phone_number && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground truncate">
                  {tPatient('phone')}: {patient.phone_number}
                </p>
              </CardContent>
            )}
          </Card>
        ))}

        {searchResults && searchResults.patients.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {t('showingResults', { count: searchResults.patients.length, total: searchResults.total })}
          </p>
        )}
      </div>
    </div>
  );
}
