'use client';
import React, { useState, ChangeEvent } from 'react';
import {
  Search,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  nationalId: string;
  birthDate: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
}

export default function SearchPatients() {
  const [nationalId, setNationalId] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Patient | null>(null);

  const handleSearch = () => {
    if (nationalId.length < 14) {
      return;
    }
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      const exists = Math.random() > 0.3;
      if (exists) {
        setSearchResult({
          id: '1',
          name: 'Ahmed Mohamed Hassan',
          nationalId: nationalId,
          birthDate: '12/01/1995',
          phone: '+20 123 456 7890',
          lastVisit: '2 weeks ago',
          totalVisits: 5,
        });
      } else {
        setSearchResult(null);
      }
    }, 1500);
  };

  const viewProfile = () => {
    window.location.hash = 'patient-profile';
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
    setNationalId(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Search Patients</h1>
          <p className="text-sm text-gray-600">Search by National ID</p>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label
              htmlFor="nationalId"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              National ID Number
            </label>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="nationalId"
                type="text"
                value={nationalId}
                onChange={handleInputChange}
                placeholder="Enter 14-digit National ID"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || nationalId.length !== 14}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
              type="button"
            >
              {searching ? 'Searching...' : 'Search Patient'}
            </button>
          </div>

          {!searching && searchResult && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {searchResult.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {searchResult.nationalId}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Birth Date</span>
                  <span className="font-semibold text-gray-900">
                    {searchResult.birthDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="font-semibold text-gray-900">
                    {searchResult.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Visit</span>
                  <span className="font-semibold text-gray-900">
                    {searchResult.lastVisit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Visits</span>
                  <span className="font-semibold text-gray-900">
                    {searchResult.totalVisits}
                  </span>
                </div>
              </div>

              <button
                onClick={viewProfile}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                type="button"
              >
                View Full Profile
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {!searching && nationalId.length === 14 && !searchResult && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-orange-900 mb-1">
                    Patient Not Found
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">
                    No patient record found with this National ID.
                  </p>
                  <Link href="/simple/scan-id">
                    <button
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm"
                      type="button"
                    >
                      Scan ID to Register
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button
            onClick={() => (window.location.hash = 'doctor-dashboard')}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
            type="button"
          >
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => (window.location.hash = 'scan-id')}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
            type="button"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Scan</span>
          </button>
          <button
            className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 text-blue-600"
            type="button"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </button>
          <Link href="/simple/">
            <button
              className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600"
              type="button"
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
