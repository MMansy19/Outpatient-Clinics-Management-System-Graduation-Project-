'use client';

import { useMemo } from 'react';
import { useGetPatientVisits } from '@/lib/api/queries/useVisits';
import { useGetPatientMedications } from '@/lib/api/queries/useMedications';
import { useGetPatientLabs } from '@/lib/api/queries/useLabs';
import { useGetPatientScans } from '@/lib/api/queries/useScans';

interface UsePatientDataOptions {
  enabled?: boolean;
}

export function usePatientData(patientId: number, options: UsePatientDataOptions = {}) {
  const { enabled = true } = options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enabled; // used for conditional logic in the future

  const {
    data: visits,
    isLoading: loadingVisits,
    error: visitsError,
    refetch: refetchVisits,
  } = useGetPatientVisits(patientId);

  const {
    data: medications,
    isLoading: loadingMedications,
    error: medicationsError,
    refetch: refetchMedications,
  } = useGetPatientMedications(patientId);

  const {
    data: labs,
    isLoading: loadingLabs,
    error: labsError,
    refetch: refetchLabs,
  } = useGetPatientLabs(patientId);

  const {
    data: scans,
    isLoading: loadingScans,
    error: scansError,
    refetch: refetchScans,
  } = useGetPatientScans(patientId);

  const isLoading = loadingVisits || loadingMedications || loadingLabs || loadingScans;

  const hasError = visitsError || medicationsError || labsError || scansError;

  const refetchAll = () => {
    refetchVisits();
    refetchMedications();
    refetchLabs();
    refetchScans();
  };

  // Computed data
  const stats = useMemo(() => {
    const totalVisits = visits?.length || 0;
    const totalMedications = medications?.length || 0;
    const totalLabs = labs?.length || 0;
    const totalScans = scans?.length || 0;

    const latestVisit = visits?.[0] || null;
    const latestVitals = latestVisit?.vitals || null;

    return {
      totalVisits,
      totalMedications,
      totalLabs,
      totalScans,
      latestVisit,
      latestVitals,
    };
  }, [visits, medications, labs, scans]);

  return {
    // Data
    visits,
    medications,
    labs,
    scans,

    // Loading states
    isLoading,
    loadingVisits,
    loadingMedications,
    loadingLabs,
    loadingScans,

    // Errors
    hasError,
    visitsError,
    medicationsError,
    labsError,
    scansError,

    // Refetch functions
    refetchAll,
    refetchVisits,
    refetchMedications,
    refetchLabs,
    refetchScans,

    // Computed stats
    stats,
  };
}
