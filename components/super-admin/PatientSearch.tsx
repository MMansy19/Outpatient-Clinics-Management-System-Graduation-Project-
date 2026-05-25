'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2, User, Calendar } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { superAdminApi } from '@/lib/api/superAdmin.service';
import { Gender } from '@/lib/api/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { searchPatientByNationalId } from '@/lib/offline/offlineSearch';
import { upsertPatients } from '@/lib/offline/patientCache';

interface SuperAdminPatientSearchProps {
  onSelectPatient: (patient: {
    id: string;
    name: string;
    gender?: Gender;
    dateOfBirth?: string;
    socialSecurityNumber: string;
    address?: string | null;
    job?: string | null;
  }) => void;
}

export function SuperAdminPatientSearch({ onSelectPatient }: SuperAdminPatientSearchProps) {
  const t = useTranslations('superAdmin');
  const tValidation = useTranslations('validation');
  const tSearch = useTranslations('search');
  const { isOnline } = useNetworkStatus();

  const [nationalId, setNationalId] = useState('');
  const [nationalIdError, setNationalIdError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<'online' | 'offline' | null>(null);

  const isValidNationalId = (id: string): boolean => {
    const trimmedId = id.trim();
    return /^\d{14}$/.test(trimmedId);
  };

  const validateNationalId = (id: string): boolean => {
    if (!id.trim()) {
      setNationalIdError('');
      return false;
    }
    if (!isValidNationalId(id)) {
      setNationalIdError(tValidation('nationalIdLength'));
      return false;
    }
    setNationalIdError('');
    return true;
  };

  const handleNationalIdChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setNationalId(digitsOnly);
    validateNationalId(digitsOnly);
  };

  const handleSearch = async () => {
    if (!nationalId || !isValidNationalId(nationalId)) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResultSource(null);

    // ── Offline branch: hit Dexie cache + pending mutations directly ─────
    if (!isOnline) {
      try {
        const cached = await searchPatientByNationalId(nationalId);
        if (!cached) {
          setError(t('patientNotFound'));
        } else {
          setResultSource('offline');
          onSelectPatient({
            id: String(cached.id),
            name: cached.name,
            gender: cached.gender as Gender | undefined,
            dateOfBirth: cached.dateOfBirth,
            socialSecurityNumber: cached.socialSecurityNumber ?? nationalId,
            address: cached.address ?? null,
            job: cached.job ?? null,
          });
        }
      } catch (err) {
        console.error('Offline patient search error:', err);
        setError(t('searchError'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const patient = await superAdminApi.searchPatientBySSN(nationalId);
      // Write-through so subsequent offline lookups hit the cache.
      try {
        await upsertPatients(patient);
      } catch (e) {
        console.warn('[SuperAdminPatientSearch] upsertPatients failed:', e);
      }
      setResultSource('online');
      onSelectPatient({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        socialSecurityNumber: patient.socialSecurityNumber,
        address: patient.address,
        job: patient.job,
      });
    } catch (err: any) {
      console.error('Patient search error:', err);
      if (err.response?.status === 404) {
        setError(t('patientNotFound'));
      } else {
        setError(t('searchError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nationalId && isValidNationalId(nationalId) && !isLoading) {
      handleSearch();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-medical-primary" />
          {t('searchPatients')}
        </CardTitle>
        <CardDescription>
          {t('searchPatientsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('nationalIdPlaceholder')}
              value={nationalId}
              onChange={(e) => handleNationalIdChange(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={14}
              className="font-mono text-lg tracking-widest"
            />
            {nationalIdError && (
              <p className="text-sm text-destructive mt-1">{nationalIdError}</p>
            )}
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={!nationalId || !isValidNationalId(nationalId) || isLoading}
            className="bg-medical-primary hover:bg-medical-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {t('search')}
          </Button>
        </div>

        {hasSearched && !isLoading && !error && (
          <div className="text-sm text-muted-foreground">
            {t('enterNationalIdPrompt')}
          </div>
        )}

        {resultSource === 'offline' && !isLoading && !error && (
          <div className="rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            {tSearch('showingOfflineResults')}
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">{t('searchTips')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-medical-primary" />
              <span>{t('tip1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-medical-secondary" />
              <span>{t('tip2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-medical-info" />
              <span>{t('tip3')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SuperAdminQuickSearchProps {
  onSelectPatient: (patient: {
    id: string;
    name: string;
    gender?: Gender;
    dateOfBirth?: string;
    socialSecurityNumber: string;
    address?: string | null;
    job?: string | null;
  }) => void;
}

export function SuperAdminQuickSearch({ onSelectPatient }: SuperAdminQuickSearchProps) {
  const t = useTranslations('superAdmin');

  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');

  const isValidNationalId = (id: string): boolean => {
    return /^\d{14}$/.test(id.trim());
  };

  const handleSearch = async () => {
    if (!nationalId || !isValidNationalId(nationalId)) return;

    try {
      const patient = await superAdminApi.searchPatientBySSN(nationalId);
      onSelectPatient({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        socialSecurityNumber: patient.socialSecurityNumber,
        address: patient.address,
        job: patient.job,
      });
      setNationalId('');
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(t('patientNotFound'));
      } else {
        setError(t('searchError'));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={t('searchByNationalId')}
        value={nationalId}
        onChange={(e) => {
          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 14);
          setNationalId(digitsOnly);
          setError('');
        }}
        onKeyDown={handleKeyDown}
        className="h-9 text-sm"
      />
      <Button
        size="sm"
        onClick={handleSearch}
        disabled={!isValidNationalId(nationalId)}
        variant="outline"
        className="border-medical-primary text-medical-primary hover:bg-medical-primary/10"
      >
        <Search className="h-4 w-4" />
      </Button>
      {error && <p className="text-xs text-destructive absolute -bottom-5">{error}</p>}
    </div>
  );
}