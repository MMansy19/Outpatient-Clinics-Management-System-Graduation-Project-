"use client";

import React, { useState } from 'react';
import {
  User,
  Calendar,
  Pill,
  Mic,
  StopCircle,
  Check,
  Edit,
  Plus,
  X,
} from 'lucide-react';

interface PatientData {
  name: string;
  nationalId: string;
  birthDate: string;
  age: number;
  gender: string;
  phone: string;
  bloodType: string;
  address: string;
}

interface Visit {
  id: number;
  date: string;
  doctor: string;
  diagnosis: string;
  status: string;
}

interface Medication {
  id: number;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  date: string;
}

interface ExtractedMedication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface ExtractedData {
  diagnosis: string;
  temperature: string;
  medications: ExtractedMedication[];
  followUp: string;
}

type ActiveTab = 'info' | 'visits' | 'medications';

export default function PatientProfile() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [editingTranscript, setEditingTranscript] = useState<boolean>(false);
  const [showAddVisit, setShowAddVisit] = useState<boolean>(false);
  const [showAddMedication, setShowAddMedication] = useState<boolean>(false);
  // const audioRef = useRef<HTMLAudioElement>(null);

  const patientData: PatientData = {
    name: 'Ahmed Mohamed Hassan',
    nationalId: '29512011234567',
    birthDate: '12/01/1995',
    age: 29,
    gender: 'Male',
    phone: '+20 123 456 7890',
    bloodType: 'A+',
    address: 'Cairo, Egypt',
  };

  const visits: Visit[] = [
    {
      id: 1,
      date: '15/01/2025',
      doctor: 'Dr. Ahmed Mohamed',
      diagnosis: 'Annual Checkup',
      status: 'completed',
    },
    {
      id: 2,
      date: '20/12/2024',
      doctor: 'Dr. Sara Hassan',
      diagnosis: 'Flu Symptoms',
      status: 'completed',
    },
  ];

  const medications: Medication[] = [
    {
      id: 1,
      name: 'Amoxicillin',
      dose: '500mg',
      frequency: '3x daily',
      duration: '7 days',
      date: '20/12/2024',
    },
    {
      id: 2,
      name: 'Paracetamol',
      dose: '500mg',
      frequency: 'As needed',
      duration: '5 days',
      date: '20/12/2024',
    },
  ];

  const startRecording = () => {
    setRecording(true);
    setTranscribedText('');
    setExtractedData(null);
  };

  const stopRecording = async () => {
    setRecording(false);

    setTimeout(() => {
      const mockTranscript =
        'Patient presents with fever and cough for the past 3 days. Temperature 38.5°C. Prescribed Amoxicillin 500mg three times daily for 7 days and Paracetamol 500mg as needed. Follow-up in one week.';
      setTranscribedText(mockTranscript);

      setTimeout(() => {
        setExtractedData({
          diagnosis: 'Fever and cough',
          temperature: '38.5°C',
          medications: [
            {
              name: 'Amoxicillin',
              dose: '500mg',
              frequency: '3x daily',
              duration: '7 days',
            },
            {
              name: 'Paracetamol',
              dose: '500mg',
              frequency: 'As needed',
              duration: '5 days',
            },
          ],
          followUp: 'One week',
        });
      }, 1000);
    }, 2000);
  };

  const acceptExtractedData = () => {
    alert('Visit data saved successfully!');
    setTranscribedText('');
    setExtractedData(null);
  };

  const handleTranscriptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTranscribedText(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {patientData.name}
              </h1>
              <p className="text-sm text-gray-600">
                {patientData.age} years • {patientData.gender}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {!transcribedText && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">Voice Recording</h3>
                <p className="text-xs text-gray-600">Record visit notes</p>
              </div>
              {recording && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 font-medium">
                    Recording...
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                recording
                  ? 'bg-red-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
              }`}
              type="button"
            >
              {recording ? (
                <>
                  <StopCircle className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Voice Recording
                </>
              )}
            </button>
          </div>
        )}

        {transcribedText && !extractedData && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Transcribed Text</h3>
              <button
                onClick={() => setEditingTranscript(!editingTranscript)}
                className="text-blue-600 font-medium text-sm flex items-center gap-1"
                type="button"
              >
                {editingTranscript ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
                {editingTranscript ? 'Done' : 'Edit'}
              </button>
            </div>
            {editingTranscript ? (
              <textarea
                value={transcribedText}
                onChange={handleTranscriptChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                rows={6}
              />
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {transcribedText}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <div className="flex-1 text-xs text-gray-600">
                Processing with AI...
              </div>
            </div>
          </div>
        )}

        {extractedData && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Extracted Data</h3>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Diagnosis</p>
                <p className="font-semibold text-gray-900">
                  {extractedData.diagnosis}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Vital Signs</p>
                <p className="font-semibold text-gray-900">
                  Temperature: {extractedData.temperature}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">Medications</p>
                {extractedData.medications.map((med, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {med.name} {med.dose}
                    </p>
                    <p className="text-xs text-gray-600">
                      {med.frequency} for {med.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={acceptExtractedData}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                type="button"
              >
                <Check className="w-5 h-5" />
                Accept & Save
              </button>
              <button
                onClick={() => setEditingTranscript(true)}
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold"
                type="button"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
            type="button"
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'visits'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
            type="button"
          >
            Visits
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'medications'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
            type="button"
          >
            Meds
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">
              Patient Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">National ID</span>
                <span className="font-semibold text-gray-900">
                  {patientData.nationalId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Birth Date</span>
                <span className="font-semibold text-gray-900">
                  {patientData.birthDate}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Blood Type</span>
                <span className="font-semibold text-gray-900">
                  {patientData.bloodType}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="font-semibold text-gray-900">
                  {patientData.phone}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Address</span>
                <span className="font-semibold text-gray-900 text-right">
                  {patientData.address}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAddVisit(!showAddVisit)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              type="button"
            >
              <Plus className="w-5 h-5" />
              Schedule New Visit
            </button>

            {showAddVisit && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">New Visit</h3>
                  <button onClick={() => setShowAddVisit(false)} type="button">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
                    type="button"
                  >
                    Schedule Visit
                  </button>
                </div>
              </div>
            )}

            {visits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {visit.date}
                      </p>
                      <p className="text-sm text-gray-600">{visit.doctor}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {visit.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 ml-13">{visit.diagnosis}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAddMedication(!showAddMedication)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              type="button"
            >
              <Plus className="w-5 h-5" />
              Add Medication
            </button>

            {showAddMedication && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">New Medication</h3>
                  <button
                    onClick={() => setShowAddMedication(false)}
                    type="button"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Medication name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Dose (e.g., 500mg)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., 3x daily)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 7 days)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold"
                    type="button"
                  >
                    Add Medication
                  </button>
                </div>
              </div>
            )}

            {medications.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      {med.dose} • {med.frequency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {med.duration} • Prescribed {med.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
