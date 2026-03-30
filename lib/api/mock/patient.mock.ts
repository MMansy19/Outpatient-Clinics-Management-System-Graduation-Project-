import type { PatientByIdResponse } from '../types';
import { Gender } from '../types';
import type {
  PatientMedicalHistory,
  PatientStats,
  PatientAppointment,
} from '../patient.types';

export const mockPatientProfile: PatientByIdResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  address: '123 Nasr City, Cairo, Egypt',
  job: 'Software Engineer',
  socialSecurityNumber: '12345678901234',
  gender: Gender.MALE,
  firstName: 'Ahmed',
  lastName: 'Mohamed',
  dateOfBirth: '1990-05-15',
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockPatientHistory: PatientMedicalHistory = {
  visits: [
    {
      id: 'visit-001',
      diagnoses: 'Common cold with mild fever',
      diagnosesAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      clinicName: 'Internal Medicine Clinic',
      createdAt: '2024-11-20T09:30:00Z',
    },
    {
      id: 'visit-002',
      diagnoses: 'Annual checkup - all results normal',
      diagnosesAudioUrl: null,
      doctorName: 'Dr. Omar Hassan',
      doctorSpeciality: 'Cardiology',
      clinicName: 'Cardiology Clinic',
      createdAt: '2024-10-15T14:00:00Z',
    },
    {
      id: 'visit-003',
      diagnoses: 'Follow-up for blood pressure monitoring',
      diagnosesAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      clinicName: 'Internal Medicine Clinic',
      createdAt: '2024-09-10T11:00:00Z',
    },
    {
      id: 'visit-004',
      diagnoses: 'Vitamin D deficiency - prescribed supplements',
      diagnosesAudioUrl: null,
      doctorName: 'Dr. Fatma Ali',
      doctorSpeciality: 'Endocrinology',
      clinicName: 'Endocrinology Clinic',
      createdAt: '2024-07-22T16:30:00Z',
    },
    {
      id: 'visit-005',
      diagnoses: 'Initial consultation - general health assessment',
      diagnosesAudioUrl: null,
      doctorName: 'Dr. Mohamed Ibrahim',
      doctorSpeciality: 'General Practice',
      clinicName: 'General Practice Clinic',
      createdAt: '2024-01-20T10:00:00Z',
    },
  ],
  medications: [
    {
      id: 'med-001',
      name: 'Vitamin D3',
      dosage: '5000 IU',
      period: '3 months',
      comments: 'Take once daily with food',
      commentsAudioUrl: null,
      doctorName: 'Dr. Fatma Ali',
      doctorSpeciality: 'Endocrinology',
      createdAt: '2024-07-22T16:30:00Z',
    },
    {
      id: 'med-002',
      name: 'Amlodipine',
      dosage: '5mg',
      period: 'Ongoing',
      comments: 'Take in the morning for blood pressure control',
      commentsAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      createdAt: '2024-09-10T11:00:00Z',
    },
    {
      id: 'med-003',
      name: 'Vitamin C',
      dosage: '1000mg',
      period: '1 month',
      comments: 'Take once daily to boost immunity',
      commentsAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      createdAt: '2024-11-20T09:30:00Z',
    },
  ],
  labs: [
    {
      id: 'lab-001',
      name: 'Complete Blood Count (CBC)',
      photoUrl: '/mock/labs/cbc-result.jpg',
      comments: 'All values within normal range',
      commentsAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      createdAt: '2024-10-15T14:00:00Z',
    },
    {
      id: 'lab-002',
      name: 'Lipid Profile',
      photoUrl: '/mock/labs/lipid-result.jpg',
      comments: 'LDL slightly elevated - dietary recommendations provided',
      commentsAudioUrl: null,
      doctorName: 'Dr. Omar Hassan',
      doctorSpeciality: 'Cardiology',
      createdAt: '2024-10-15T14:30:00Z',
    },
    {
      id: 'lab-003',
      name: 'Vitamin D Level',
      photoUrl: '/mock/labs/vitamin-d-result.jpg',
      comments: 'Deficient - supplementation recommended',
      commentsAudioUrl: null,
      doctorName: 'Dr. Fatma Ali',
      doctorSpeciality: 'Endocrinology',
      createdAt: '2024-07-22T17:00:00Z',
    },
    {
      id: 'lab-004',
      name: 'Thyroid Function Tests',
      photoUrl: '/mock/labs/thyroid-result.jpg',
      comments: 'TSH and T4 within normal limits',
      commentsAudioUrl: null,
      doctorName: 'Dr. Fatma Ali',
      doctorSpeciality: 'Endocrinology',
      createdAt: '2024-07-22T17:15:00Z',
    },
  ],
  scans: [
    {
      id: 'scan-001',
      name: 'Chest X-Ray',
      type: 'X-RAY',
      photoUrl: '/mock/scans/chest-xray.jpg',
      comments: 'No abnormalities detected',
      commentsAudioUrl: null,
      doctorName: 'Dr. Omar Hassan',
      doctorSpeciality: 'Cardiology',
      createdAt: '2024-10-15T15:00:00Z',
    },
    {
      id: 'scan-002',
      name: 'Abdominal Ultrasound',
      type: 'ULTRA SOUND',
      photoUrl: '/mock/scans/abdominal-us.jpg',
      comments: 'Liver and gallbladder normal',
      commentsAudioUrl: null,
      doctorName: 'Dr. Sarah Ahmed',
      doctorSpeciality: 'Internal Medicine',
      createdAt: '2024-09-10T12:00:00Z',
    },
  ],
};

export const mockPatientStats: PatientStats = {
  totalVisits: 5,
  totalMedications: 3,
  totalLabs: 4,
  totalScans: 2,
  lastVisitDate: '2024-11-20T09:30:00Z',
  lastVisitDoctor: 'Dr. Sarah Ahmed',
};

export const mockPatientAppointments: PatientAppointment[] = [
  {
    id: 'apt-001',
    date: '2024-12-15',
    time: '10:00',
    doctorName: 'Dr. Sarah Ahmed',
    doctorSpeciality: 'Internal Medicine',
    clinicName: 'Internal Medicine Clinic',
    status: 'scheduled',
  },
  {
    id: 'apt-002',
    date: '2025-01-10',
    time: '14:30',
    doctorName: 'Dr. Omar Hassan',
    doctorSpeciality: 'Cardiology',
    clinicName: 'Cardiology Clinic',
    status: 'scheduled',
  },
];

export const generateMockQRToken = (patientId: string, patientName: string) => {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  return {
    token: btoa(JSON.stringify({
      patientId,
      patientName,
      permissions: ['view_history', 'view_profile'],
      iat: Date.now(),
      exp: expiresAt,
    })),
    patientId,
    patientName,
    expiresAt,
    patientData: mockPatientProfile,
    medicalHistory: mockPatientHistory,
  };
};
