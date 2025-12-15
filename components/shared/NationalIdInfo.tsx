'use client';

import { Calendar, MapPin, User } from 'lucide-react';
import { extractGenderFromNationalId, extractBirthdateFromNationalId, extractGovernorateFromNationalId, calculateAgeFromNationalId } from '@/lib/schemas/auth.schemas';

interface NationalIdInfoProps {
  nationalId: string;
  locale?: string;
}

/**
 * Reusable component to display extracted information from Egyptian National ID
 * Shows: Gender, Birthdate (with age), and Governorate
 */
export function NationalIdInfo({ nationalId, locale = 'en' }: NationalIdInfoProps) {
  if (!nationalId || nationalId.length !== 14) {
    return null;
  }

  const gender = extractGenderFromNationalId(nationalId);
  const birthdate = extractBirthdateFromNationalId(nationalId);
  const age = calculateAgeFromNationalId(nationalId);
  const governorate = extractGovernorateFromNationalId(nationalId);

  if (!gender || !birthdate || !governorate) {
    return null;
  }

  return (
    <div className="rounded-md bg-muted/50 p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="font-medium">Gender:</span>
        <span className="text-foreground">{gender}</span>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">Birthdate:</span>
        <span className="text-foreground">
          {birthdate.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {age && <span className="text-muted-foreground ml-2">({age} years old)</span>}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="font-medium">Place of Birth:</span>
        <span className="text-foreground">
          {locale === 'ar' ? governorate.nameAr : governorate.nameEn}
          <span className="text-muted-foreground ml-2">({governorate.code})</span>
        </span>
      </div>
    </div>
  );
}
