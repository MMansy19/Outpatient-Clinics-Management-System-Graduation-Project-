'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminSearchPatientBySSN } from '@/lib/api/queries/useAdmin';
import type { AdminPatientSearchResponse } from '@/lib/api/types';

interface AdminPatientSearchProps {
  onPatientFound: (patient: AdminPatientSearchResponse) => void;
}

export function AdminPatientSearch({ onPatientFound }: AdminPatientSearchProps) {
  const t = useTranslations('admin');
  const [ssn, setSsn] = useState('');
  const [searchSSN, setSearchSSN] = useState('');

  const { data: patient, isLoading, error } = useAdminSearchPatientBySSN(searchSSN);

  const handleSearch = () => {
    if (ssn.length > 0) {
      setSearchSSN(ssn);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={ssn}
          onChange={(e) => setSsn(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('enterSSN')}
          className="flex-1"
          maxLength={14}
        />
        <Button onClick={handleSearch} disabled={isLoading || ssn.length === 0}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">{t('search')}</span>
        </Button>
      </div>

      {error && (
        <div className="text-center py-4 text-red-500 text-sm">
          {t('searchError')}
        </div>
      )}

      {searchSSN && !isLoading && patient === null && (
        <div className="text-center py-8 text-muted-foreground">
          {t('patientNotFound')}
        </div>
      )}

      {patient && (
        <div
          className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onPatientFound(patient)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-medical-primary/10 rounded-full">
              <User className="h-5 w-5 text-medical-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{patient.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('ssn')}: {patient.socialSecurityNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {patient.gender === 0 ? t('male') : t('female')} • {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="outline">
              {t('viewProfile')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
