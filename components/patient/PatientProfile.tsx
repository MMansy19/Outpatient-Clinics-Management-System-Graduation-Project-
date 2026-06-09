'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format, differenceInYears, differenceInDays } from 'date-fns';
import { Gender } from '@/lib/api/types';
import { useGetPatientProfile, useUpdatePatientProfile } from '@/lib/api/hooks/usePatient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Edit,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export function PatientProfile() {
  const t = useTranslations('patient.profile');
  const tCommon = useTranslations('common');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    address?: string;
    job?: string;
  }>({});

  const { data: profile, isLoading } = useGetPatientProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdatePatientProfile();

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const years = differenceInYears(new Date(), birthDate);
    const days = differenceInDays(new Date(), birthDate) % 365;
    return { years, days };
  };

  const handleSave = () => {
    updateProfile(editedData, {
      onSuccess: () => {
        toast.success(t('savedSuccess'));
        setIsEditing(false);
        setEditedData({});
      },
      onError: () => {
        toast.error(t('saveError'));
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleEditChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-48 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const age = calculateAge(profile.dateOfBirth);

  const infoFields = [
    {
      icon: User,
      label: t('fullName'),
      value: `${profile.firstName} ${profile.lastName}`,
      editable: false,
      field: null,
    },
    {
      icon: FileText,
      label: t('nationalId'),
      value: profile.socialSecurityNumber,
      editable: false,
      field: null,
    },
    {
      icon: Calendar,
      label: t('dateOfBirth'),
      value: `${format(new Date(profile.dateOfBirth), 'MMMM d, yyyy')} (${age.years} ${tCommon('years')})`,
      editable: false,
      field: null,
    },
    {
      icon: User,
      label: t('gender'),
      value: profile.gender === Gender.MALE ? tCommon('male') : tCommon('female'),
      editable: false,
      field: null,
    },
    {
      icon: Briefcase,
      label: t('job'),
      value: editedData.job ?? profile.job ?? '-',
      editable: true,
      field: 'job',
    },
    {
      icon: MapPin,
      label: t('address'),
      value: editedData.address ?? profile.address ?? '-',
      editable: true,
      field: 'address',
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('personalInfo')}</CardTitle>
            <CardDescription>{t('contactInfo')}</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('editProfile')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {infoFields.map((field, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-full bg-muted">
                  <field.icon className="h-5 w-5 text-medical-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                  {field.editable && isEditing ? (
                    <Input
                      value={editedData[field.field as keyof typeof editedData] ?? profile[field.field as keyof typeof profile] as string ?? ''}
                      onChange={(e) => handleEditChange(field.field!, e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-medical-primary hover:bg-medical-primary/90"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('saveChanges')}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
