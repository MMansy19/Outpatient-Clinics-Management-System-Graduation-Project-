'use client';


import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Calendar, Plus, Filter, X } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';

import { useDebounce } from '@/lib/hooks/useDebounce';
import { useSearchPatients } from '@/lib/api/queries/usePatients';
import { useGetClinics } from '@/lib/api/queries/useClinics';
import { calculateAge } from '@/lib/utils/formatDate';
import { Gender } from '@/types/entities/Patient';
import type { SearchFilters } from '@/types/entities/Visit';

interface PatientSearchProps {
  onSelectPatient: (patientId: number, nationalId?: string) => void;
  onAddNew: () => void;
}

export function PatientSearch({ onSelectPatient, onAddNew }: PatientSearchProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState<SearchFilters['period']>('today');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');
  
  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [gender, setGender] = useState<string>('all');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [nationalId, setNationalId] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedNationalId = useDebounce(nationalId, 300);

  // Build filters object
  const filters: SearchFilters = {
    query: debouncedSearch || undefined,
    period,
    clinicId: selectedClinicId === 'all' ? undefined : Number(selectedClinicId),
    gender: gender === 'all' ? undefined : (gender as 'male' | 'female'),
    minAge: minAge ? Number(minAge) : undefined,
    maxAge: maxAge ? Number(maxAge) : undefined,
    nationalId: debouncedNationalId || undefined,
  };

  const { data: clinics } = useGetClinics();
  const { data: searchResults, isLoading } = useSearchPatients(filters);

  const clearFilters = () => {
    setSearchQuery('');
    setNationalId('');
    setGender('all');
    setMinAge('');
    setMaxAge('');
    setPeriod('today');
    setSelectedClinicId('all');
  };

  const activeFiltersCount = [
    searchQuery,
    nationalId,
    gender !== 'all',
    minAge,
    maxAge,
    selectedClinicId !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medical-primary">{t('patientSearch')}</h2>
          <p className="text-sm text-muted-foreground">{t('searchSubtitle')}</p>
        </div>
      </div>

      {/* Primary Search */}
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

          <Button
            variant={showAdvancedFilters ? 'default' : 'outline'}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{tSearch('advancedFilters')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                {tCommon('filter')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* National ID Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{tPatient('nationalId')}</label>
                <Input
                  type="text"
                  placeholder={tSearch('enterNationalId')}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              {/* Gender Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">{tPatient('gender')}</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tSearch('allGenders')}</SelectItem>
                    <SelectItem value="male">{tPatient('male')}</SelectItem>
                    <SelectItem value="female">{tPatient('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Age */}
              <div>
                <label className="text-sm font-medium mb-2 block">{tSearch('minAge')}</label>
                <Input
                  type="number"
                  placeholder={tSearch('from')}
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  min="0"
                  max="150"
                />
              </div>

              {/* Max Age */}
              <div>
                <label className="text-sm font-medium mb-2 block">{tSearch('maxAge')}</label>
                <Input
                  type="number"
                  placeholder={tSearch('to')}
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  min="0"
                  max="150"
                />
              </div>
            </div>

            {/* Clinic Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">{tSearch('clinic')}</label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger className="w-full">
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
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary">
              {tCommon('search')}: {searchQuery}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          {nationalId && (
            <Badge variant="secondary">
              {tPatient('nationalId')}: {nationalId}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => setNationalId('')}
              />
            </Badge>
          )}
          {gender !== 'all' && (
            <Badge variant="secondary">
              {tPatient('gender')}: {gender === 'male' ? tPatient('male') : gender === 'female' ? tPatient('female') : gender}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => setGender('all')}
              />
            </Badge>
          )}
          {minAge && (
            <Badge variant="secondary">
              {tSearch('minAge')}: {minAge}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => setMinAge('')}
              />
            </Badge>
          )}
          {maxAge && (
            <Badge variant="secondary">
              {tSearch('maxAge')}: {maxAge}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => setMaxAge('')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        )}

        {!isLoading && searchResults?.patients?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="hidden sm:block text-muted-foreground">{t('noPatients')}</p>
              <Button variant="outline" onClick={onAddNew} className="mt-4">
                <Plus className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('addNewPatient')}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {searchResults?.patients?.map((patient) => (
          <Card
            key={patient.id}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => onSelectPatient(Number(patient.id), String(patient.national_id))}
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
                    {patient.birthdate ? calculateAge(patient.birthdate) : tCommon('unknown')} {tPatient('years')}
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

        {searchResults && searchResults.patients?.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {t('showingResults', { count: searchResults.patients.length, total: searchResults.total })}
          </p>
        )}
      </div>
    </div>
  );
}
