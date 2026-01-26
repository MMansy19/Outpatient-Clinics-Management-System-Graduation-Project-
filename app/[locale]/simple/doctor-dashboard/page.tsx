'use client';
import React, { useState } from 'react';
import {
  Camera,
  Mic,
  Search,
  User,
  ChevronRight,
  Check,
  X,
  Plus,
  Activity,
  FileText,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Edit,
} from 'lucide-react';

// Mock translations
const useTranslations = (key) =>
  ({
    doctor: {
      addNewPatient: 'Add New Patient',
      patientSearch: 'Patient Search',
      newVisit: 'New Visit',
      recentVisits: 'Recent Visits',
      totalVisits: 'Total Visits',
    },
    scan: {
      scanNationalId: 'Scan National ID',
      selectRegistrationMethod: 'Choose how to register the patient',
      scanDescription: 'Quick auto-fill using camera',
      recommended: 'Recommended',
      manualEntry: 'Manual Entry',
      manualDescription: 'Fill the form yourself',
    },
    patient: {
      nationalId: 'National ID',
      age: 'Age',
      years: 'years',
      male: 'Male',
      female: 'Female',
      phone: 'Phone',
    },
    visit: {
      weight: 'Weight',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate',
      temperature: 'Temperature',
      chiefComplaint: 'Chief Complaint',
      diagnosis: 'Diagnosis & Treatment',
      vitals: 'Vitals',
    },
    common: {
      cancel: 'Cancel',
      loading: 'Loading...',
    },
  })[key] || ((k) => k);

const DoctorDashboard = () => {
  // Flow states
  const [currentStep, setCurrentStep] = useState('home');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showRegistrationSheet, setShowRegistrationSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showScanPreview, setShowScanPreview] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);

  // Visit data
  const [visitData, setVisitData] = useState({
    chiefComplaint: '',
    diagnosis: '',
    weight: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
  });

  const t = useTranslations;

  // Stats (would come from API)
  const stats = {
    scheduled: 8,
    completed: 5,
    pending: 3,
  };

  // Handlers for Patient Registration Sheet
  const handleOpenRegistration = () => {
    setShowRegistrationSheet(true);
  };

  const handleSelectScanId = () => {
    setShowRegistrationSheet(false);
    setShowScanner(true);
  };

  const handleSelectManualEntry = () => {
    setShowRegistrationSheet(false);
    setShowAddPatientDialog(true);
    setScannedData(null);
  };

  // Handlers for Scanner
  const handleScanComplete = (data) => {
    setScannedData(data);
    setShowScanner(false);
    setShowScanPreview(true);
  };

  const handleScanPreviewConfirm = (data) => {
    setScannedData(data);
    setShowScanPreview(false);
    setShowAddPatientDialog(true);
  };

  const handleScanPreviewRetake = () => {
    setShowScanPreview(false);
    setShowScanner(true);
  };

  // Handler for Add Patient Dialog
  const handlePatientCreated = (patientId) => {
    setSelectedPatientId(patientId);
    setShowAddPatientDialog(false);
    setCurrentStep('visit');
  };

  // Handler for Patient Search
  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentStep('profile');
  };

  // Handler for Voice Recording
  const handleVoiceInput = (field) => {
    setActiveVoiceField(field);
    setShowVoiceRecorder(true);
  };

  const handleTranscriptionComplete = (text) => {
    if (activeVoiceField) {
      setVisitData((prev) => ({
        ...prev,
        [activeVoiceField]: text,
      }));
    }
    setShowVoiceRecorder(false);
    setActiveVoiceField(null);
  };

  const resetFlow = () => {
    setCurrentStep('home');
    setSelectedPatientId(null);
    setScannedData(null);
    setVisitData({
      chiefComplaint: '',
      diagnosis: '',
      weight: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Dr. Ahmed</h1>
              <p className="text-xs text-gray-500">Cardiology</p>
            </div>
          </div>
          {currentStep !== 'home' && (
            <button
              onClick={resetFlow}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* HOME VIEW */}
      {currentStep === 'home' && (
        <div className="px-4 pt-6 space-y-6 animate-fadeIn">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Calendar,
                label: 'Scheduled',
                value: stats.scheduled,
                color: 'blue',
              },
              {
                icon: Check,
                label: 'Done',
                value: stats.completed,
                color: 'emerald',
              },
              {
                icon: Clock,
                label: 'Pending',
                value: stats.pending,
                color: 'orange',
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 shadow-sm animate-slideUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-2`}
                >
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Action - New Patient Visit */}
          <div
            className="relative animate-slideUp"
            style={{ animationDelay: '300ms' }}
          >
            <button
              onClick={handleOpenRegistration}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-lg">New Patient Visit</p>
                    <p className="text-sm text-white/90">Scan ID or search</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>

          {/* Quick Search - This would trigger PatientSearch component */}
          <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => setCurrentStep('search')}
              className="w-full relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search by name or ID..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                readOnly
              />
            </button>
          </div>
        </div>
      )}

      {/* PATIENT SEARCH VIEW */}
      {currentStep === 'search' && (
        <div className="px-4 pt-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Patient Search
            </h2>
            <p className="text-gray-600 mb-4">
              In a real implementation, this would render the PatientSearch
              component with full search capabilities, filters, and patient
              selection.
            </p>
            <div className="space-y-3">
              <button className="w-full p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors">
                <p className="font-medium text-gray-900">
                  Component: PatientSearch
                </p>
                <p className="text-sm text-gray-600">
                  Props: onSelectPatient, onAddNew
                </p>
              </button>
              <button className="w-full p-4 bg-emerald-50 rounded-xl text-left hover:bg-emerald-100 transition-colors">
                <p className="font-medium text-gray-900">
                  API: useSearchPatients()
                </p>
                <p className="text-sm text-gray-600">
                  Real-time search with filters
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT PROFILE VIEW */}
      {currentStep === 'profile' && selectedPatientId && (
        <div className="px-4 pt-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Patient Profile
            </h2>
            <p className="text-gray-600 mb-4">
              PatientProfile component would display here with:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="font-medium text-gray-900">
                  Patient ID: {selectedPatientId}
                </p>
                <p className="text-sm text-gray-600">
                  Full profile with medical history
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('visit')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start New Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISIT FORM VIEW */}
      {currentStep === 'visit' && selectedPatientId && (
        <div className="px-4 pt-6 space-y-6 animate-fadeIn pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Visit</h2>
              <p className="text-sm text-gray-600">
                Patient ID: {selectedPatientId}
              </p>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Vitals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Weight (kg)', key: 'weight', placeholder: '70' },
                {
                  label: 'BP (mmHg)',
                  key: 'bloodPressure',
                  placeholder: '120/80',
                },
                { label: 'HR (bpm)', key: 'heartRate', placeholder: '72' },
                { label: 'Temp (°C)', key: 'temperature', placeholder: '37' },
              ].map((vital) => (
                <div key={vital.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {vital.label}
                  </label>
                  <input
                    type="text"
                    placeholder={vital.placeholder}
                    value={visitData[vital.key]}
                    onChange={(e) =>
                      setVisitData((prev) => ({
                        ...prev,
                        [vital.key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Chief Complaint with Voice */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Chief Complaint
              </label>
              <button
                onClick={() => handleVoiceInput('chiefComplaint')}
                className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <Mic className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            <textarea
              rows={3}
              value={visitData.chiefComplaint}
              onChange={(e) =>
                setVisitData((prev) => ({
                  ...prev,
                  chiefComplaint: e.target.value,
                }))
              }
              placeholder="Describe symptoms..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Diagnosis with Voice */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Diagnosis & Treatment
              </label>
              <button
                onClick={() => handleVoiceInput('diagnosis')}
                className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors"
              >
                <Mic className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
            <textarea
              rows={4}
              value={visitData.diagnosis}
              onChange={(e) =>
                setVisitData((prev) => ({ ...prev, diagnosis: e.target.value }))
              }
              placeholder="Diagnosis and treatment plan..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Real Implementation Note:
            </p>
            <p className="text-xs text-blue-700">
              This would use the VisitForm component with full validation, API
              integration via useCreateVisit(), and proper error handling.
            </p>
          </div>

          <button
            onClick={() => {
              alert('Visit would be saved via API');
              resetFlow();
            }}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Complete Visit
          </button>
        </div>
      )}

      {/* MODALS - Integration Points */}

      {/* Patient Registration Sheet Modal */}
      {showRegistrationSheet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-scaleIn">
            <h2 className="text-2xl font-bold text-center mb-2">
              Add New Patient
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Choose registration method
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSelectScanId}
                className="w-full p-5 bg-blue-50 border-2 border-blue-500 rounded-xl text-left hover:bg-blue-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-blue-900">
                        Scan National ID
                      </h3>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700">
                      Quick auto-fill using camera
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Recommended
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSelectManualEntry}
                className="w-full p-5 bg-white border-2 border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      Manual Entry
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fill the form yourself
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowRegistrationSheet(false)}
              className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scanner Modal Placeholder */}
      {showScanner && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center animate-fadeIn">
          <div className="text-center p-8">
            <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              NationalIdScanner Component
            </h3>
            <p className="text-gray-600 mb-6">
              Full camera interface with OCR processing
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              <div className="p-4 bg-blue-50 rounded-xl text-left">
                <p className="font-medium text-sm">Features:</p>
                <ul className="text-xs text-gray-700 mt-2 space-y-1">
                  <li>• Camera/Upload tabs</li>
                  <li>• Real OCR via useScanNationalId()</li>
                  <li>• Auto-extraction of ID data</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  // Simulate scan complete with mock data
                  handleScanComplete({
                    nationalId: '30202041234567',
                    firstName: 'Ahmed',
                    lastName: 'Hassan',
                    fullName: 'Ahmed Hassan',
                    dateOfBirth: new Date(2002, 1, 20),
                    gender: 'male',
                    confidence: 0.95,
                  });
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Simulate Scan Complete
              </button>
              <button
                onClick={() => setShowScanner(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Preview Modal Placeholder */}
      {showScanPreview && scannedData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-scaleIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Scan Complete!</h2>
              <p className="text-gray-600">Review extracted data</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="font-medium">{scannedData.fullName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">National ID</p>
                <p className="font-medium">{scannedData.nationalId}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p className="font-medium">
                  {scannedData.dateOfBirth.toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="font-medium">{scannedData.gender}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleScanPreviewRetake}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Rescan
              </button>
              <button
                onClick={() => handleScanPreviewConfirm(scannedData)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Dialog Placeholder */}
      {showAddPatientDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full my-8 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-4">
              AddPatientDialog Component
            </h2>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="font-medium mb-2">Props:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • prefilledData:{' '}
                    {scannedData ? 'From scan' : 'Manual entry'}
                  </li>
                  <li>• dataSource: {scannedData ? 'scan' : 'manual'}</li>
                  <li>• onSuccess: Navigate to visit form</li>
                </ul>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="font-medium mb-2">Features:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Auto-fill from scanned data</li>
                  <li>• National ID validation & extraction</li>
                  <li>• Form validation with Zod</li>
                  <li>• API: useCreatePatient()</li>
                </ul>
              </div>
              {scannedData && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="font-medium mb-2">Pre-filled Data:</p>
                  <p className="text-sm text-gray-700">
                    {scannedData.fullName} - {scannedData.nationalId}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPatientDialog(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePatientCreated(123)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Simulate Create Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recorder Modal Placeholder */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-scaleIn">
            <h2 className="text-xl font-bold mb-4">
              VoiceRecorderDialog Component
            </h2>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="font-medium mb-2">Features:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Record/Upload tabs</li>
                  <li>• Real ASR via asrApi.transcribe()</li>
                  <li>• Audio playback</li>
                  <li>• Field: {activeVoiceField}</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVoiceRecorder(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Simulate transcription
                  handleTranscriptionComplete(
                    'Patient complains of persistent headache for 3 days'
                  );
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Simulate Transcription
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
          animation-fill-mode: both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
