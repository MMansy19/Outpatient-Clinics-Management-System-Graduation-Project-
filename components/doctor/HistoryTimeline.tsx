'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ResponsiveLine } from '@nivo/line';
import { Activity, Beaker, Image as ImageIcon, Pill, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { InlineProgressBar } from '@/components/shared/InlineProgressBar';
import { OfflinePill } from '@/components/shared/OfflinePill';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useGetMedicalHistoryTimeline } from '@/lib/api/queries/useMedicalHistory';
import { formatDate } from '@/lib/utils/formatDate';
import type { VisitWithRelations } from '@/types/entities/Visit';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';
import type { Medication } from '@/types/entities/Medication';

interface HistoryTimelineProps {
  patientId: string;
}

type FilterType = 'all' | 'visits' | 'labs' | 'scans' | 'medications';

export function HistoryTimeline({ patientId }: HistoryTimelineProps) {
  const t = useTranslations('patient');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { isOnline } = useNetworkStatus();

  const { data: timeline, isLoading, isFetching } = useGetMedicalHistoryTimeline(patientId);

  // Prepare weight trend data for chart
  const weightTrendData = useMemo(() => {
    if (!timeline?.visits) return [];
    
    const dataPoints = timeline.visits
      .filter((v) => v.data.vitals?.weight)
      .map((v) => ({
        x: new Date(v.date),
        y: v.data.vitals.weight,
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    return [
      {
        id: 'weight',
        data: dataPoints,
      },
    ];
  }, [timeline?.visits]);

  // Prepare blood pressure trend data for chart
  const bpTrendData = useMemo(() => {
    if (!timeline?.visits) return [];

    const systolicData = timeline.visits
      .filter((v) => v.data.vitals?.blood_pressure_systolic)
      .map((v) => ({
        x: new Date(v.date),
        y: v.data.vitals.blood_pressure_systolic!,
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    const diastolicData = timeline.visits
      .filter((v) => v.data.vitals?.blood_pressure_diastolic)
      .map((v) => ({
        x: new Date(v.date),
        y: v.data.vitals.blood_pressure_diastolic!,
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    return [
      {
        id: 'Systolic',
        data: systolicData,
      },
      {
        id: 'Diastolic',
        data: diastolicData,
      },
    ];
  }, [timeline?.visits]);

  // Combine and filter all timeline records
  const allRecords = useMemo(() => {
    if (!timeline) return [];

    const records = [];

    if (filterType === 'all' || filterType === 'visits') {
      records.push(
        ...(timeline.visits || []).map((item) => ({
          ...item,
          displayType: 'visit' as const,
        }))
      );
    }

    if (filterType === 'all' || filterType === 'labs') {
      records.push(
        ...(timeline.labs || []).map((item) => ({
          ...item,
          displayType: 'lab' as const,
        }))
      );
    }

    if (filterType === 'all' || filterType === 'scans') {
      records.push(
        ...(timeline.scans || []).map((item) => ({
          ...item,
          displayType: 'scan' as const,
        }))
      );
    }

    if (filterType === 'all' || filterType === 'medications') {
      records.push(
        ...(timeline.medications || []).map((item) => ({
          ...item,
          displayType: 'medication' as const,
        }))
      );
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeline, filterType]);

  if (isLoading) {
    return (
      <div className="relative space-y-4">
        <InlineProgressBar active={true} />
        <div className="skeleton h-64 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (!timeline || allRecords.length === 0) {
    return (
      <div className="relative space-y-4">
        <InlineProgressBar active={isFetching} />
        {!isOnline && <OfflinePill source="offline" />}
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t('noHistory')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasWeightData = weightTrendData[0]?.data.length > 0;
  const hasBPData = bpTrendData[0]?.data.length > 0 || bpTrendData[1]?.data.length > 0;

  return (
    <div className="relative space-y-6">
      <InlineProgressBar active={isFetching && !isLoading} />
      {!isOnline && <OfflinePill source="offline" />}
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-medical-primary' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t('allRecords')}
        </Button>
        <Button
          variant={filterType === 'visits' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('visits')}
          className={filterType === 'visits' ? 'bg-medical-primary' : ''}
        >
          <Activity className="mr-2 h-4 w-4" />
          {t('visits')}
        </Button>
        <Button
          variant={filterType === 'labs' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('labs')}
          className={filterType === 'labs' ? 'bg-medical-primary' : ''}
        >
          <Beaker className="mr-2 h-4 w-4" />
          {t('labs')}
        </Button>
        <Button
          variant={filterType === 'scans' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('scans')}
          className={filterType === 'scans' ? 'bg-medical-primary' : ''}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {t('scans')}
        </Button>
        <Button
          variant={filterType === 'medications' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('medications')}
          className={filterType === 'medications' ? 'bg-medical-primary' : ''}
        >
          <Pill className="mr-2 h-4 w-4" />
          {t('medications')}
        </Button>
      </div>

      {/* Weight Trend Chart */}
      {hasWeightData && (filterType === 'all' || filterType === 'visits') && (
        <Card>
          <CardHeader>
            <CardTitle>{t('weightTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <ResponsiveLine
                data={weightTrendData}
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                xScale={{ type: 'time', format: 'native' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisBottom={{
                  format: '%b %d',
                  legend: 'Date',
                  legendOffset: 46,
                  legendPosition: 'middle',
                  tickRotation: -45,
                }}
                axisLeft={{
                  legend: 'Weight (kg)',
                  legendOffset: -50,
                  legendPosition: 'middle',
                }}
                colors="#10B981"
                pointSize={10}
                pointColor="#10B981"
                pointBorderWidth={2}
                pointBorderColor="#fff"
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                enableSlices="x"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blood Pressure Trend Chart */}
      {hasBPData && (filterType === 'all' || filterType === 'visits') && (
        <Card>
          <CardHeader>
            <CardTitle>{t('bpTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <ResponsiveLine
                data={bpTrendData}
                margin={{ top: 20, right: 110, bottom: 60, left: 60 }}
                xScale={{ type: 'time', format: 'native' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisBottom={{
                  format: '%b %d',
                  legend: 'Date',
                  legendOffset: 46,
                  legendPosition: 'middle',
                  tickRotation: -45,
                }}
                axisLeft={{
                  legend: 'Blood Pressure (mmHg)',
                  legendOffset: -50,
                  legendPosition: 'middle',
                }}
                colors={['#EF4444', '#3B82F6']}
                pointSize={10}
                pointBorderWidth={2}
                pointBorderColor="#fff"
                useMesh={true}
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    symbolSize: 12,
                    symbolShape: 'circle',
                  },
                ]}
                enableSlices="x"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeline')}</CardTitle>
          <CardDescription>
            {t('showingResults', { count: allRecords.length, total: allRecords.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRecords.map((record, index) => (
              <TimelineCard key={`${record.displayType}-${index}`} record={record} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TimelineCardProps {
  record: {
    date: Date;
    type: string;
    displayType: 'visit' | 'lab' | 'scan' | 'medication';
    data: VisitWithRelations | Lab | Scan | Medication;
  };
}

function TimelineCard({ record }: TimelineCardProps) {
  const t = useTranslations();

  const getIcon = () => {
    switch (record.displayType) {
      case 'visit':
        return <Activity className="h-5 w-5 text-medical-primary" />;
      case 'lab':
        return <Beaker className="h-5 w-5 text-medical-secondary" />;
      case 'scan':
        return <ImageIcon className="h-5 w-5 text-medical-info" />;
      case 'medication':
        return <Pill className="h-5 w-5 text-medical-warning" />;
    }
  };

  const getBorderColor = () => {
    switch (record.displayType) {
      case 'visit':
        return 'border-l-medical-primary';
      case 'lab':
        return 'border-l-medical-secondary';
      case 'scan':
        return 'border-l-medical-info';
      case 'medication':
        return 'border-l-medical-warning';
    }
  };

  return (
    <div className={`border-l-4 ${getBorderColor()} pl-4 py-3 hover:bg-accent rounded-r-lg transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">{getIcon()}</div>
          <div className="flex-1">
            {record.displayType === 'visit' && (
              <>
                <Badge variant="outline" className="mb-2">
                  {t('patient.visits')}
                </Badge>
                <p className="font-medium">{(record.data as VisitWithRelations).chief_complaint}</p>
                <p className="text-sm text-muted-foreground mt-1">{(record.data as VisitWithRelations).diagnosis}</p>
                {(record.data as VisitWithRelations).diagnosesAudioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={(record.data as VisitWithRelations).diagnosesAudioUrl!} compact />
                  </div>
                )}
                {(record.data as VisitWithRelations).doctor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Dr. {(record.data as VisitWithRelations).doctor.username}
                  </p>
                )}
              </>
            )}

            {record.displayType === 'lab' && (
              <>
                <Badge variant="outline" className="mb-2">
                  {t('patient.labs')}
                </Badge>
                <p className="font-medium">{(record.data as Lab).name || 'Lab Test'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(record.data as Lab).comments || 'Results available'}
                </p>
                {(record.data as Lab).commentsAudioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={(record.data as Lab).commentsAudioUrl!} compact />
                  </div>
                )}
              </>
            )}

            {record.displayType === 'scan' && (
              <>
                <Badge variant="outline" className="mb-2">
                  {t('patient.scans')}
                </Badge>
                <p className="font-medium">{(record.data as Scan).type || 'Imaging Study'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(record.data as Scan).comments || 'Report available'}
                </p>
                {(record.data as Scan).commentsAudioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={(record.data as Scan).commentsAudioUrl!} compact />
                  </div>
                )}
              </>
            )}

            {record.displayType === 'medication' && (
              <>
                <Badge variant="outline" className="mb-2">
                  {t('patient.medications')}
                </Badge>
                <p className="font-medium">{(record.data as Medication).name || 'Medication'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(record.data as Medication).dosage && `${(record.data as Medication).dosage} - `}
                  {(record.data as Medication).period || 'As prescribed'}
                </p>
                {(record.data as Medication).commentsAudioUrl && (
                  <div className="mt-2">
                    <AudioPlayer src={(record.data as Medication).commentsAudioUrl!} compact />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(record.date)}
          </div>
        </div>
      </div>
    </div>
  );
}
