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

import { useSearchPatients } from '@/lib/api/queries/usePatients';
import { EnrichedScanData } from '@/types/ocr';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';

interface NationalIdSearchProps {
  onSelectPatient: (patient: any) => void;
  onAddNew: () => void;
}

export function NationalIdSearch({ onSelectPatient, onAddNew }: NationalIdSearchProps) {
  const t = useTranslations('doctor');

  // Search states
  const [nationalId, setNationalId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  // Build filters object for search
  const filters = {
    nationalId: nationalId || undefined,
  };

  const { data: searchResults, isLoading } = useSearchPatients(filters);

  // Handle scan completion - automatically navigate to profile
  const handleScanComplete = (data: EnrichedScanData) => {
    setScannedData(data);
    setNationalId(data.nationalId || data.socialSecurityNumber || '');
    setIsScannerOpen(false);
    setHasScanned(true);
  };

  // Effect to automatically navigate to patient profile when search results arrive after scan
  useEffect(() => {
    if (hasScanned && !isLoading && searchResults) {
      if (searchResults.patients && searchResults.patients.length > 0) {
        // Patient found - navigate to their profile
        const patient = searchResults.patients[0];
        onSelectPatient({
          id: patient.id,
          name: patient.name,
          gender: patient.gender,
          dateOfBirth: patient.birthdate instanceof Date ? patient.birthdate.toISOString() : new Date(patient.birthdate).toISOString(),
          socialSecurityNumber: patient.national_id,
          address: patient.address,
        });
      } else {
        // Patient not found - show profile with scanned data and option to register
        const fullName = scannedData?.fullName || `${scannedData?.firstName || ''} ${scannedData?.lastName || ''}`.trim();
        onSelectPatient({
          id: null, // No existing patient ID
          name: fullName || 'Unknown',
          gender: scannedData?.gender === 'male' ? 0 : 1,
          dateOfBirth: scannedData?.dateOfBirth ? scannedData?.dateOfBirth.toISOString() : new Date().toISOString(),
          socialSecurityNumber: scannedData?.socialSecurityNumber || scannedData?.nationalId || '',
          address: scannedData?.location || scannedData?.address || '',
          isNewPatient: true, // Flag to indicate this is a scanned but unregistered patient
          scannedData: scannedData, // Store full scanned data
        });
      }
      setHasScanned(false); // Reset flag
    }
  }, [hasScanned, isLoading, searchResults, scannedData, onSelectPatient]);

  const handleManualSearch = () => {
    if (nationalId && searchResults?.patients?.[0]) {
      const patient = searchResults.patients[0];
      // Convert patient data to match PatientProfile expected format
      onSelectPatient({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.birthdate instanceof Date ? patient.birthdate.toISOString() : new Date(patient.birthdate).toISOString(),
        socialSecurityNumber: patient.national_id,
        address: patient.address,
      });
    }
  };

  const handleResultClick = (patient: any) => {
    // Convert patient data to match PatientProfile expected format
    onSelectPatient({
      id: patient.id,
      name: patient.name,
      gender: patient.gender,
      dateOfBirth: patient.birthdate instanceof Date ? patient.birthdate.toISOString() : new Date(patient.birthdate).toISOString(),
      socialSecurityNumber: patient.national_id,
      address: patient.address,
    });
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
          <CardTitle className="text-lg">Search by National ID</CardTitle>
          <CardDescription>
            Scan the patient's National ID or enter it manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter National ID"
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
              <ScanLine className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('scanID')}</span>
            </Button>
            <Button
              onClick={handleManualSearch}
              disabled={!nationalId || isLoading}
              className="bg-medical-primary hover:bg-medical-primary/90"
            >
              {isLoading ? (
                <Loader2 className="sm:mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="sm:mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t('search')}</span>
            </Button>
          </div>

          {/* Scan Results */}
          {scannedData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Scanned Information:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(scannedData.fullName || scannedData.firstName || scannedData.lastName) && (
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">
                      {scannedData.fullName || `${scannedData.firstName || ''} ${scannedData.lastName || ''}`.trim()}
                    </span>
                  </div>
                )}
                {(scannedData.nationalId || scannedData.socialSecurityNumber) && (
                  <div>
                    <span className="text-muted-foreground">National ID:</span>{' '}
                    <span className="font-medium">{scannedData.nationalId || scannedData.socialSecurityNumber}</span>
                  </div>
                )}
                {scannedData.dateOfBirth && (
                  <div>
                    <span className="text-muted-foreground">Birth Date:</span>{' '}
                    <span className="font-medium">{formatDate(scannedData.dateOfBirth)}</span>
                  </div>
                )}
                {scannedData.gender && (
                  <div>
                    <span className="text-muted-foreground">Gender:</span>{' '}
                    <span className="font-medium">{scannedData.gender}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {/* Note: Results are now automatically displayed in PatientProfile component */}
      {/* This section is kept for manual search feedback */}
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

        {!isLoading && !hasScanned && nationalId && searchResults?.patients?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No patient found with this National ID</p>
              <Button variant="outline" onClick={onAddNew} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Register New Patient
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !hasScanned && searchResults?.patients?.length === 1 && (
          <Card className="cursor-pointer transition-colors hover:bg-accent border-2 border-medical-primary">
            <CardHeader
              onClick={() => handleResultClick(searchResults.patients[0])}
              className="pb-3 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate text-medical-primary">
                    {searchResults.patients[0].name}
                  </CardTitle>
                  <CardDescription>
                    National ID: {searchResults.patients[0].national_id}
                  </CardDescription>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {String(searchResults.patients[0].gender) === '0' || searchResults.patients[0].gender === 'male' ? 'Male' :
                     String(searchResults.patients[0].gender) === '1' || searchResults.patients[0].gender === 'female' ? 'Female' : 'Other'}
                  </div>
                  <div className="text-muted-foreground">
                    ID Match Found
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {searchResults && !hasScanned && searchResults.patients?.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {t('showingResults', { count: searchResults.patients.length, total: searchResults.total })}
          </p>
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
