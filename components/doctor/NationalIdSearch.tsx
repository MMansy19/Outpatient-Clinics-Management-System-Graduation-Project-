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

  // Search states
  const [nationalId, setNationalId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  // Fetch patient by National ID
  const { data: patient, isLoading, error, refetch } = useGetPatientByNationalId(nationalId);

  // Handle scan completion - automatically navigate to profile
  const handleScanComplete = (data: EnrichedScanData) => {
    setScannedData(data);
    setNationalId(data.nationalId || data.socialSecurityNumber || '');
    setIsScannerOpen(false);
    setHasScanned(true);
  };

  // Effect to automatically navigate to patient profile when search results arrive after scan
  useEffect(() => {
    if (hasScanned && nationalId) {
      refetch().then(() => {
        // The navigation will be handled by the separate effect below
      });
    }
  }, [hasScanned, nationalId, refetch]);

  // Effect to handle patient data and navigate to profile
  useEffect(() => {
    if (!nationalId) return;

    if (patient) {
      // Patient found - navigate to their profile
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
      setHasScanned(false);
    } else if (error && hasScanned && scannedData) {
      // Patient not found - show profile with scanned data and option to register
      const fullName = scannedData.fullName || `${scannedData.firstName || ''} ${scannedData.lastName || ''}`.trim();
      // Transform gender from string ('male'/'female') to Gender enum
      const genderValue = scannedData.gender === 'male' ? Gender.MALE : Gender.FEMALE;

      onSelectPatient({
        id: null, // No existing patient ID - will be assigned when registered
        name: fullName || 'Unknown',
        gender: genderValue,
        dateOfBirth: scannedData.dateOfBirth ? scannedData.dateOfBirth.toISOString() : new Date().toISOString(),
        socialSecurityNumber: scannedData.socialSecurityNumber || scannedData.nationalId || '',
        address: scannedData.location || scannedData.address || '',
        isNewPatient: true, // Flag to indicate this is a scanned but unregistered patient
        scannedData: scannedData, // Store full scanned data
      });
      setHasScanned(false);
    }
  }, [patient, error, hasScanned, scannedData, nationalId, onSelectPatient]);

  const handleManualSearch = () => {
    if (nationalId && !isLoading) {
      setHasScanned(true);
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
        {isLoading && hasScanned && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-medical-primary mb-4" />
              <p className="text-muted-foreground mb-2">Searching for patient...</p>
              <p className="text-sm text-muted-foreground">National ID: {nationalId}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasScanned && error && (
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
