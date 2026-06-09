'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  useGetPatientVisits,
  useGetPatientMedications,
  useGetPatientLabs,
  useGetPatientScans,
} from '@/lib/api/hooks/usePatient';
import {
  Calendar,
  Pill,
  FlaskConical,
  Scan,
  User,
  Stethoscope,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageDialog } from '@/components/shared/ImageDialog';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

function Pagination({
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
  label,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  label: string;
}) {
  const t = useTranslations('admin');
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
      <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        {t('page')} {page} {t('of')} {totalPages} &bull; {totalItems} {label}
      </p>
      <div className="flex items-center gap-2 justify-center sm:justify-end">
        <Button
          onClick={onPrevious}
          disabled={page === 1}
          variant="outline"
          size="sm"
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">{t('previous')}</span>
        </Button>
        <div className="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 rounded-md">
          {page} / {totalPages}
        </div>
        <Button
          onClick={onNext}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
          className="h-9"
        >
          <span className="hidden sm:inline mr-1">{t('next')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function usePagination<T>(items: T[] | undefined) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / PAGE_SIZE));
  const paginatedItems = items?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];
  const totalItems = items?.length || 0;

  const handlePrevious = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return { page, totalPages, totalItems, paginatedItems, handlePrevious, handleNext, setPage };
}

export function PatientHistory() {
  const t = useTranslations('patient.history');
  const [activeTab, setActiveTab] = useState('visits');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: visits, isLoading: loadingVisits } = useGetPatientVisits();
  const { data: medications, isLoading: loadingMedications } = useGetPatientMedications();
  const { data: labs, isLoading: loadingLabs } = useGetPatientLabs();
  const { data: scans, isLoading: loadingScans } = useGetPatientScans();

  const isLoading = loadingVisits || loadingMedications || loadingLabs || loadingScans;

  const visitsPagination = usePagination(visits);
  const medsPagination = usePagination(medications);
  const labsPagination = usePagination(labs);
  const scansPagination = usePagination(scans);

  const activePagination = useMemo(() => {
    switch (activeTab) {
      case 'visits': return visitsPagination;
      case 'medications': return medsPagination;
      case 'labs': return labsPagination;
      case 'scans': return scansPagination;
      default: return visitsPagination;
    }
  }, [activeTab, visitsPagination, medsPagination, labsPagination, scansPagination]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('noRecords')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

          {/* Visits Tab */}
          <TabsContent value="visits" className="mt-0">
            <VisitsTable
              items={visitsPagination.paginatedItems}
              page={visitsPagination.page}
              totalPages={visitsPagination.totalPages}
              totalItems={visitsPagination.totalItems}
              onPrevious={visitsPagination.handlePrevious}
              onNext={visitsPagination.handleNext}
            />
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="mt-0">
            <MedicationsTable
              items={medsPagination.paginatedItems}
              page={medsPagination.page}
              totalPages={medsPagination.totalPages}
              totalItems={medsPagination.totalItems}
              onPrevious={medsPagination.handlePrevious}
              onNext={medsPagination.handleNext}
            />
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-0">
            <LabsTable
              items={labsPagination.paginatedItems}
              page={labsPagination.page}
              totalPages={labsPagination.totalPages}
              totalItems={labsPagination.totalItems}
              onPrevious={labsPagination.handlePrevious}
              onNext={labsPagination.handleNext}
              onViewImage={setSelectedImage}
            />
          </TabsContent>

          {/* Scans Tab */}
          <TabsContent value="scans" className="mt-0">
            <ScansTable
              items={scansPagination.paginatedItems}
              page={scansPagination.page}
              totalPages={scansPagination.totalPages}
              totalItems={scansPagination.totalItems}
              onPrevious={scansPagination.handlePrevious}
              onNext={scansPagination.handleNext}
              onViewImage={setSelectedImage}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <ImageDialog
        src={selectedImage}
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </Card>
  );
}

function VisitsTable({
  items,
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
}: {
  items: any[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const t = useTranslations('patient.history');

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">{t('noVisits')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden space-y-3">
        {items.map((visit, index) => (
          <div
            key={visit.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {format(new Date(visit.createdAt), 'MMM d, yyyy')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {visit.clinicName}
                </h3>
              </div>
            </div>

            {visit.diagnoses && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('diagnosis')}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                      {visit.diagnoses}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {visit.diagnosesAudioUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <AudioPlayer src={visit.diagnosesAudioUrl} compact />
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('doctor')}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {visit.doctorName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('doctor')}</TableHead>
                <TableHead className="font-semibold">{t('speciality')}</TableHead>
                <TableHead className="font-semibold">{t('diagnosis')}</TableHead>
                <TableHead className="font-semibold">{t('audioRecording')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(visit.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{visit.doctorName}</TableCell>
                  <TableCell>{visit.doctorSpeciality}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={visit.diagnoses}>
                      {visit.diagnoses}
                    </div>
                  </TableCell>
                  <TableCell>
                    {visit.diagnosesAudioUrl ? (
                      <AudioPlayer src={visit.diagnosesAudioUrl} compact />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPrevious={onPrevious}
        onNext={onNext}
        label="visits"
      />
    </div>
  );
}

function MedicationsTable({
  items,
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
}: {
  items: any[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const t = useTranslations('patient.history');

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">{t('noMedications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden space-y-3">
        {items.map((med, index) => (
          <div
            key={med.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {format(new Date(med.createdAt), 'MMM d, yyyy')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {med.name}
                </h3>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('dosage')}:</span>
                <span className="font-medium">{med.dosage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('period')}:</span>
                <span className="font-medium">{med.period}</span>
              </div>
            </div>

            {med.comments && (
              <p className="text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {med.comments}
              </p>
            )}

            {med.commentsAudioUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <AudioPlayer src={med.commentsAudioUrl} compact />
              </div>
            )}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('doctor')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {med.doctorName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('doctor')}</TableHead>
                <TableHead className="font-semibold">{t('dosage')}</TableHead>
                <TableHead className="font-semibold">{t('period')}</TableHead>
                <TableHead className="font-semibold">{t('comments')}</TableHead>
                <TableHead className="font-semibold">{t('audioRecording')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((med) => (
                <TableRow key={med.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(med.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{med.doctorName}</TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>{med.period}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={med.comments || ''}>
                      {med.comments || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {med.commentsAudioUrl ? (
                      <AudioPlayer src={med.commentsAudioUrl} compact />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPrevious={onPrevious}
        onNext={onNext}
        label="medications"
      />
    </div>
  );
}

function LabsTable({
  items,
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
  onViewImage,
}: {
  items: any[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onViewImage: (url: string) => void;
}) {
  const t = useTranslations('patient.history');

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">{t('noLabs')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden space-y-3">
        {items.map((lab, index) => (
          <div
            key={lab.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {format(new Date(lab.createdAt), 'MMM d, yyyy')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {lab.name}
                </h3>
              </div>
            </div>

            {lab.comments && (
              <p className="text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {lab.comments}
              </p>
            )}

            {lab.commentsAudioUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <AudioPlayer src={lab.commentsAudioUrl} compact />
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('doctor')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {lab.doctorName}
                  </p>
                </div>
              </div>
              {lab.photoUrl && (
                <Button variant="ghost" size="sm" onClick={() => onViewImage(lab.photoUrl)}>
                  <ImageIcon className="h-4 w-4 mr-1" />
                  {t('viewImage')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('doctor')}</TableHead>
                <TableHead className="font-semibold">{t('comments')}</TableHead>
                <TableHead className="font-semibold">{t('image')}</TableHead>
                <TableHead className="font-semibold">{t('audioRecording')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((lab) => (
                <TableRow key={lab.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(lab.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{lab.doctorName}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={lab.comments || ''}>
                      {lab.comments || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lab.photoUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewImage(lab.photoUrl)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {t('viewImage')}
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {lab.commentsAudioUrl ? (
                      <AudioPlayer src={lab.commentsAudioUrl} compact />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPrevious={onPrevious}
        onNext={onNext}
        label="labs"
      />
    </div>
  );
}

function ScansTable({
  items,
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
  onViewImage,
}: {
  items: any[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  onViewImage: (url: string) => void;
}) {
  const t = useTranslations('patient.history');

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">{t('noScans')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden space-y-3">
        {items.map((scan, index) => (
          <div
            key={scan.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Scan className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {format(new Date(scan.createdAt), 'MMM d, yyyy')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {scan.name}
                </h3>
                <span className="text-xs text-orange-500 font-medium">{scan.type}</span>
              </div>
            </div>

            {scan.comments && (
              <p className="text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {scan.comments}
              </p>
            )}

            {scan.commentsAudioUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <AudioPlayer src={scan.commentsAudioUrl} compact />
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('doctor')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {scan.doctorName}
                  </p>
                </div>
              </div>
              {scan.photoUrl && (
                <Button variant="ghost" size="sm" onClick={() => onViewImage(scan.photoUrl)}>
                  <ImageIcon className="h-4 w-4 mr-1" />
                  {t('viewImage')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-semibold">{t('date')}</TableHead>
                <TableHead className="font-semibold">{t('doctor')}</TableHead>
                <TableHead className="font-semibold">{t('comments')}</TableHead>
                <TableHead className="font-semibold">{t('image')}</TableHead>
                <TableHead className="font-semibold">{t('audioRecording')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((scan) => (
                <TableRow key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(scan.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{scan.doctorName}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={scan.comments || ''}>
                      {scan.comments || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {scan.photoUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewImage(scan.photoUrl)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {t('viewImage')}
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {scan.commentsAudioUrl ? (
                      <AudioPlayer src={scan.commentsAudioUrl} compact />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPrevious={onPrevious}
        onNext={onNext}
        label="scans"
      />
    </div>
  );
}
