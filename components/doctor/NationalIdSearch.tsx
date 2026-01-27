'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Plus, ScanLine, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useGetPatientByNationalId } from '@/lib/api/queries/usePatients';
import { EnrichedScanData } from '@/types/ocr';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { Gender } from '@/types/entities/Patient';

interface NationalIdSearchProps {
  onSelectPatient: (patient: any) => void;
  onAddNew: () => void;
}

export function NationalIdSearch({ onSelectPatient, onAddNew }: NationalIdSearchProps) {
  const t = useTranslations('doctor');
  const tScan = useTranslations('scan');
  const tPatient = useTranslations('patient');
  const tCommon = useTranslations('common');

  // Search states
  const [nationalId, setNationalId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch patient by National ID
  const { data: patient, isLoading, error, refetch } = useGetPatientByNationalId(nationalId);

  // Handle scan completion - automatically navigate to profile
  const handleScanComplete = (data: EnrichedScanData) => {
    setScannedData(data);
    setNationalId(data.nationalId || data.socialSecurityNumber || '');
    setIsScannerOpen(false);
    setHasSearched(true);
  };

  // Effect to automatically navigate to patient profile when search results arrive after scan
  useEffect(() => {
    if (hasSearched && nationalId) {
      refetch().then(() => {
        // The navigation will be handled by the separate effect below
      });
    }
  }, [hasSearched, nationalId, refetch]);

  // Effect to handle patient data and navigate to profile
  useEffect(() => {
    if (!nationalId) return;

    // Patient found - navigate to their profile
    if (patient) {
      // Transform gender from number (0/1) to Gender enum ('male'/'female')
      const genderValue = typeof patient.gender === 'number'
        ? (patient.gender === 0 ? Gender.MALE : Gender.FEMALE)
        : patient.gender;

      onSelectPatient({
        id: patient.id,
        name: patient.name,
        gender: genderValue,
        dateOfBirth: patient?.dateOfBirth,
        socialSecurityNumber: patient?.socialSecurityNumber,
        address: patient.address,
      });
      setHasSearched(false);
    } else if (hasSearched && !isLoading && !patient && !error) {
      // Patient not found (null) - show profile with scanned data and option to register
      const fullName = scannedData?.fullName || `${scannedData?.firstName || ''} ${scannedData?.lastName || ''}`.trim();
      // Transform gender from string ('male'/'female') to Gender enum
      const genderValue = scannedData?.gender === 'male' ? Gender.MALE : Gender.FEMALE;

      onSelectPatient({
        id: null, // No existing patient ID - will be assigned when registered
        name: fullName || '',
        gender: genderValue,
        dateOfBirth: scannedData?.dateOfBirth ? scannedData.dateOfBirth.toISOString() : new Date().toISOString(),
        socialSecurityNumber: scannedData?.socialSecurityNumber || scannedData?.nationalId || nationalId,
        address: scannedData?.location || scannedData?.address || '',
        isNewPatient: true, // Flag to indicate this is a scanned but unregistered patient
        scannedData: scannedData, // Store full scanned data
      });
      setHasSearched(false);
    }
  }, [patient, isLoading, error, hasSearched, scannedData, nationalId, onSelectPatient, tCommon]);

  const handleManualSearch = () => {
    if (nationalId && !isLoading) {
      setHasSearched(true);
      setScannedData(null); // Clear scanned data for manual search
      refetch();
    }
  };

  // Helper function to format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tScan('searchByNationalId')}</CardTitle>
          <CardDescription>
            {tScan('scanOrEnter')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tScan('enterNationalId')}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleManualSearch();
                  }
                }}
              />
            </div>
            <Button
              onClick={() => setIsScannerOpen(true)}
              variant="outline"
              className="border-medical-primary text-medical-primary hover:bg-medical-primary/10"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleManualSearch}
              disabled={!nationalId || isLoading}
              className="bg-medical-primary hover:bg-medical-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Scan Results */}
          {scannedData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">{tScan('extractedData')}:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(scannedData.fullName || scannedData.firstName || scannedData.lastName) && (
                  <div>
                    <span className="text-muted-foreground">{tPatient('name')}:</span>{' '}
                    <span className="font-medium">
                      {scannedData.fullName || `${scannedData.firstName || ''} ${scannedData.lastName || ''}`.trim()}
                    </span>
                  </div>
                )}
                {(scannedData.nationalId || scannedData.socialSecurityNumber) && (
                  <div>
                    <span className="text-muted-foreground">{tPatient('nationalId')}:</span>{' '}
                    <span className="font-medium">{scannedData.nationalId || scannedData.socialSecurityNumber}</span>
                  </div>
                )}
                {scannedData.dateOfBirth && (
                  <div>
                    <span className="text-muted-foreground">{tPatient('birthdate')}:</span>{' '}
                    <span className="font-medium">{formatDate(scannedData.dateOfBirth)}</span>
                  </div>
                )}
                {scannedData.gender && (
                  <div>
                    <span className="text-muted-foreground">{tPatient('gender')}:</span>{' '}
                    <span className="font-medium">{scannedData.gender}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Status */}
      <div className="space-y-3">
        {isLoading && hasSearched && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-medical-primary mb-4" />
              <p className="text-muted-foreground mb-2">{tCommon('loading')}</p>
              <p className="text-sm text-muted-foreground">{tPatient('nationalId')}: {nationalId}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasSearched && patient === null && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">{tScan('noPatientFound')}</p>
              <p className="text-sm text-muted-foreground mb-4">{tScan('registerPrompt')}</p>
              <Button variant="outline" onClick={onAddNew} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                {tPatient('registerNew')}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasSearched && error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-2">
                {tCommon('error')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('networkErrorDescription')}
              </p>
              <Button variant="outline" onClick={handleManualSearch} className="mt-2">
                <Search className="mr-2 h-4 w-4" />
                {tCommon('search')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scanner Dialog */}
      <NationalIdScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
