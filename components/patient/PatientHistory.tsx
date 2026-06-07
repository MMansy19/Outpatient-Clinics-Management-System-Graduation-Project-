'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useGetMedicalHistory,
  useGetPatientVisits,
  useGetPatientMedications,
  useGetPatientLabs,
  useGetPatientScans,
} from '@/lib/api/hooks/usePatient';
import type { HistoryFilterType } from '@/lib/api/patient.types';
import {
  Calendar,
  Pill,
  FlaskConical,
  Scan,
  User,
  Stethoscope,
  FileText,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react';
import { ImageDialog } from '@/components/shared/ImageDialog';

type RecordType = 'visit' | 'medication' | 'lab' | 'scan';

interface TimelineItem {
  id: string;
  type: RecordType;
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
  doctor?: string;
  speciality?: string;
  imageUrl?: string;
  details?: Record<string, string>;
}

export function PatientHistory() {
  const t = useTranslations('patient.history');
  const [activeTab, setActiveTab] = useState<HistoryFilterType>('visits');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { isLoading: loadingHistory } = useGetMedicalHistory();
  const { data: visits, isLoading: loadingVisits } = useGetPatientVisits();
  const { data: medications, isLoading: loadingMedications } = useGetPatientMedications();
  const { data: labs, isLoading: loadingLabs } = useGetPatientLabs();
  const { data: scans, isLoading: loadingScans } = useGetPatientScans();

  const isLoading =
    loadingHistory ||
    loadingVisits ||
    loadingMedications ||
    loadingLabs ||
    loadingScans;

  const getAllTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    visits?.forEach((visit) => {
      items.push({
        id: visit.id,
        type: 'visit',
        date: visit.createdAt,
        title: visit.diagnoses || t('noRecords'),
        doctor: visit.doctorName,
        speciality: visit.doctorSpeciality,
        details: {
          clinic: visit.clinicName,
        },
      });
    });

    medications?.forEach((med) => {
      items.push({
        id: med.id,
        type: 'medication',
        date: med.createdAt,
        title: med.name,
        subtitle: `${med.dosage} - ${med.period}`,
        description: med.comments || undefined,
        doctor: med.doctorName,
        speciality: med.doctorSpeciality,
      });
    });

    labs?.forEach((lab) => {
      items.push({
        id: lab.id,
        type: 'lab',
        date: lab.createdAt,
        title: lab.name,
        description: lab.comments || undefined,
        doctor: lab.doctorName,
        speciality: lab.doctorSpeciality,
        imageUrl: lab.photoUrl,
      });
    });

    scans?.forEach((scan) => {
      items.push({
        id: scan.id,
        type: 'scan',
        date: scan.createdAt,
        title: scan.name,
        subtitle: scan.type,
        description: scan.comments || undefined,
        doctor: scan.doctorName,
        speciality: scan.doctorSpeciality,
        imageUrl: scan.photoUrl,
      });
    });

    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getFilteredItems = (): TimelineItem[] => {
    const allItems = getAllTimelineItems();

    switch (activeTab) {
      case 'visits':
        return allItems.filter((item) => item.type === 'visit');
      case 'medications':
        return allItems.filter((item) => item.type === 'medication');
      case 'labs':
        return allItems.filter((item) => item.type === 'lab');
      case 'scans':
        return allItems.filter((item) => item.type === 'scan');
    }

    return [];
  };

  const getTypeIcon = (type: RecordType) => {
    switch (type) {
      case 'visit':
        return Calendar;
      case 'medication':
        return Pill;
      case 'lab':
        return FlaskConical;
      case 'scan':
        return Scan;
    }
  };

  const getTypeColor = (type: RecordType) => {
    switch (type) {
      case 'visit':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'medication':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'lab':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'scan':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    }
  };

  const getTypeLabel = (type: RecordType) => {
    switch (type) {
      case 'visit':
        return t('visits');
      case 'medication':
        return t('medications');
      case 'lab':
        return t('labs');
      case 'scan':
        return t('scans');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as HistoryFilterType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="visits" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{t('visits')}</span>
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex items-center gap-1">
                <Pill className="h-3 w-3" />
                <span className="hidden sm:inline">{t('medications')}</span>
              </TabsTrigger>
              <TabsTrigger value="labs" className="flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                <span className="hidden sm:inline">{t('labs')}</span>
              </TabsTrigger>
              <TabsTrigger value="scans" className="flex items-center gap-1">
                <Scan className="h-3 w-3" />
                <span className="hidden sm:inline">{t('scans')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">{t('noRecords')}</p>
                </div>
              ) : (
                <div className="relative space-y-4">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {filteredItems.map((item, index) => {
                      const Icon = getTypeIcon(item.type);
                      return (
                        <div
                          key={item.id}
                          className="relative pl-14 animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div
                            className={`absolute left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${getTypeColor(
                              item.type
                            )}`}
                          >
                            <Icon className="h-3 w-3" />
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium truncate">
                                    {item.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getTypeColor(item.type)}`}
                                  >
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                </div>

                                {item.subtitle && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.subtitle}
                                  </p>
                                )}

                                {item.description && (
                                  <p className="text-sm mt-2">{item.description}</p>
                                )}

                                {item.doctor && (
                                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {item.doctor}
                                    </span>
                                    {item.speciality && (
                                      <span className="flex items-center gap-1">
                                        <Stethoscope className="h-3 w-3" />
                                        {item.speciality}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {item.details &&
                                  Object.entries(item.details).map(
                                    ([key, value]) => (
                                      <p
                                        key={key}
                                        className="text-sm text-muted-foreground mt-1"
                                      >
                                        <span className="font-medium capitalize">
                                          {key}:
                                        </span>{' '}
                                        {value}
                                      </p>
                                    )
                                  )}

                                {item.imageUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setSelectedImage(item.imageUrl!)}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    {t('viewImage')}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                )}
                              </div>

                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(item.date), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ImageDialog
        src={selectedImage}
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
}
