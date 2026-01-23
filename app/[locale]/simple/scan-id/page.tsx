'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Check,
  Loader,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { scanAndEnrichNationalId } from '@/lib/api/nationalId.service';
import { OCRProcessingError } from '@/types/ocr';

interface ExtractedData {
  firstName: string;
  lastName: string;
  location: string;
  socialSecurityNumber: string;
  birthDate: string;
  photo?: string;
}

export default function ScanIdPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setExtractedData(null);
        setError(null);
        setShowGuide(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    setError(null);

    try {
      // Call backend OCR service via nationalId.service
      const enrichedData = await scanAndEnrichNationalId(selectedImage);

      // Extract birthdate from the enriched data
      const birthDate = extractBirthdateFromId(enrichedData.socialSecurityNumber);

      setExtractedData({
        firstName: enrichedData.firstName,
        lastName: enrichedData.lastName,
        location: enrichedData.location,
        socialSecurityNumber: enrichedData.socialSecurityNumber,
        birthDate: birthDate,
        photo: selectedImage,
      });

      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      if (err instanceof OCRProcessingError) {
        setError(err.message);
      } else {
        setError('Failed to extract data. Please try again.');
      }
      setUploading(false);
    }
  };

  const extractBirthdateFromId = (id: string): string => {
    // Extract birthdate from Egyptian National ID
    // Format: YYMMDDGGXSSS
    const year = parseInt(id.substring(0, 2));
    const month = parseInt(id.substring(2, 4));
    const day = parseInt(id.substring(4, 6));

    // Determine century (19xx or 20xx)
    const fullYear = year > 30 ? 1900 + year : 2000 + year;

    // Format as MM/DD/YYYY
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return `${monthStr}/${dayStr}/${fullYear}`;
  };

  const handleContinue = () => {
    router.push('/create-patient');
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setExtractedData(null);
    setError(null);
    setShowGuide(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/doctor-dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Scan National ID
              </h1>
              <p className="text-sm text-gray-600">Step 1 of 2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {/* Guide Card */}
        {showGuide && !selectedImage && (
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-5 mb-4 text-white animate-slide-down">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Quick Tip</h3>
                <p className="text-sm text-blue-100">
                  Place the ID on a flat surface with good lighting for best
                  results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {!selectedImage && (
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-up">
              {/* Camera Preview */}
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20" />
                <Camera className="w-20 h-20 text-white/30 relative z-10" />
                <div className="absolute inset-0 border-4 border-white/10 rounded-xl" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={triggerFileInput}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                  type="button"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={triggerFileInput}
                  className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  type="button"
                >
                  <Upload className="w-5 h-5" />
                  Upload from Gallery
                </button>
              </div>
            </div>
          )}

          {selectedImage && !extractedData && (
            <div className="bg-white rounded-2xl p-6 shadow-lg animate-slide-up">
              {/* Image Preview */}
              <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="ID"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Processing Status */}
              {uploading && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        Extracting data...
                      </p>
                      <p className="text-sm text-blue-600">
                        AI is reading the ID card
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  type="button"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Extract Data
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleRetake}
                  disabled={uploading}
                  className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  type="button"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {extractedData && (
            <div className="space-y-4 animate-slide-up">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Data Extracted Successfully!
                    </h3>
                    <p className="text-sm text-emerald-100">
                      Review the information below
                    </p>
                  </div>
                </div>
              </div>

              {/* Extracted Data Card */}
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Extracted Information
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">First Name</p>
                      <p className="font-semibold text-gray-900">
                        {extractedData.firstName}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Last Name</p>
                      <p className="font-semibold text-gray-900">
                        {extractedData.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Social Security Number</p>
                    <p className="font-semibold text-gray-900">
                      {extractedData.socialSecurityNumber}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {extractedData.location}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Birth Date</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {extractedData.birthDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                  type="button"
                >
                  Continue to Patient Profile
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleRetake}
                  className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  type="button"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Extraction Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
