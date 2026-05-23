// Mock Data Service for Development Without Backend
import type { AuthResponse, RegisterRequest } from '@/types/api';
import type { Clinic, ClinicWithStats } from '@/types/entities/Clinic';
import type { Doctor, DoctorWithClinic } from '@/types/entities/Doctor';
import type { Patient } from '@/types/entities/Patient';
import { Gender } from '@/types/entities/Patient';
import type { Visit, VisitWithRelations } from '@/types/entities/Visit';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';
import { ScanType } from '@/types/entities/Scan';
import type { Medication } from '@/types/entities/Medication';
import { MedicationPeriod, MedicationDosage } from '@/types/entities/Medication';
import { UserRole } from '@/types/entities/User';
// Storage keys
export const STORAGE_KEYS = {
  USERS: 'mock_users',
  PATIENTS: 'mock_patients',
  CLINICS: 'mock_clinics',
  VISITS: 'mock_visits',
  LABS: 'mock_labs',
  SCANS: 'mock_scans',
  MEDICATIONS: 'mock_medications',
};

// Helper to get data from localStorage
export const getStorageData = <T>(key: string, defaultData: T): T => {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

// Helper to set data in localStorage
const setStorageData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize mock clinics
const initClinics = (): Clinic[] => [
  {
    id: 1,
    global_id: 'CLI001',
    name: 'Internal Medicine Clinic',
    department: 'Internal Medicine',
    location: 'Building A, Floor 2, Kasr Al Ainy Hospital',
    phone_number: '+20 2 23654321',
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    global_id: 'CLI002',
    name: 'Orthopedics Clinic',
    department: 'Orthopedics',
    location: 'Building B, Floor 1, Cairo University Hospital',
    phone_number: '+20 2 23654322',
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 3,
    global_id: 'CLI003',
    name: 'Cardiology Clinic',
    department: 'Cardiology',
    location: 'Building C, Floor 3, Specialized Medical Center',
    phone_number: '+20 2 23654323',
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 4,
    global_id: 'CLI004',
    name: 'Neurology Clinic',
    department: 'Neurology',
    location: 'Building A, Floor 4, Kasr Al Ainy Hospital',
    phone_number: '+20 2 23654324',
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 5,
    global_id: 'CLI005',
    name: 'Emergency Department',
    department: 'Emergency Medicine',
    location: 'Ground Floor, Main Building, Cairo University Hospital',
    phone_number: '+20 2 23654325',
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
];

// Initialize mock users
export const initUsers = () => [
  {
    id: 1,
    global_id: 'DOC001',
    username: 'dr_ahmed',
    email: 'ahmed@kasralainy.edu.eg',
    password: 'password123',
    role: UserRole.DOCTOR,
    specialization: 'Cardiology',
    license_number: 'LIC001',
    phone_number: '+20 100 1234567',
    clinic_id: 3,
  },
  {
    id: 2,
    global_id: 'ADM001',
    username: 'admin',
    email: 'admin@kasralainy.edu.eg',
    password: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    id: 3,
    global_id: 'DOC002',
    username: 'dr_khaled',
    email: 'khaled@kasralainy.edu.eg',
    password: 'password123',
    role: UserRole.DOCTOR,
    specialization: 'Internal Medicine',
    license_number: 'LIC002',
    phone_number: '+20 100 2345678',
    clinic_id: 1,
  },
  {
    id: 4,
    global_id: 'DOC003',
    username: 'dr_omar',
    email: 'omar@kasralainy.edu.eg',
    password: 'password123',
    role: UserRole.DOCTOR,
    specialization: 'Orthopedics',
    license_number: 'LIC003',
    phone_number: '+20 100 3456789',
    clinic_id: 2,
  },
  {
    id: 5,
    global_id: 'DOC004',
    username: 'dr_fatima',
    email: 'fatima@kasralainy.edu.eg',
    password: 'password123',
    role: UserRole.DOCTOR,
    specialization: 'Neurology',
    license_number: 'LIC004',
    phone_number: '+20 100 4567890',
    clinic_id: 4,
  },
  {
    id: 6,
    global_id: 'DOC005',
    username: 'dr_mohamed',
    email: 'mohamed@kasralainy.edu.eg',
    password: 'password123',
    role: UserRole.DOCTOR,
    specialization: 'Emergency Medicine',
    license_number: 'LIC005',
    phone_number: '+20 100 5678901',
    clinic_id: 5,
  },
];

// Initialize mock patients
const initPatients = (): Patient[] => [
  {
    id: 1,
    global_id: 'PAT001',
    national_id: 29005151234567,
    name: 'Mohamed Ali',
    birthdate: new Date('1990-05-15'),
    gender: Gender.MALE,
    phone_number: '+20 100 1111111',
    email: 'mohamed.ali@email.com',
    address: '123 Tahrir St, Cairo',
    is_deleted: false,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: 2,
    global_id: 'PAT002',
    national_id: 28508201234567,
    name: 'Khaled Hassan',
    birthdate: new Date('1985-08-20'),
    gender: Gender.FEMALE,
    phone_number: '+20 100 3333333',
    email: 'khaled.hassan@email.com',
    address: '456 Nile St, Giza',
    is_deleted: false,  
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01'),
  },
  {
    id: 3,
    global_id: 'PAT003',
    national_id: 29503101234567,
    name: 'Omar Khalil',
    birthdate: new Date('1995-03-10'),
    gender: Gender.MALE,
    phone_number: '+20 100 5555555',
    email: 'omar.khalil@email.com',
    address: '789 Sphinx Ave, Cairo',
    is_deleted: false,
    created_at: new Date('2024-02-15'),
    updated_at: new Date('2024-02-15'),
  },
];

// Initialize mock visits
const initVisits = (): Visit[] => [
  {
    id: 1,
    global_id: 'VIS001',
    patient_id: 1,
    doctor_id: 1,
    clinic_id: 1,
    chief_complaint: 'Chest pain and shortness of breath',
    vitals: {
      weight: 75,
      height: 175,
      blood_pressure_systolic: 140,
      blood_pressure_diastolic: 90,
      heart_rate: 82,
    },
    physical_examination: 'Cardiovascular examination shows regular rhythm, no murmurs',
    diagnosis: 'Angina Pectoris - Stable',
    treatment_plan: 'Prescribed Aspirin 81mg daily, Nitroglycerin as needed. Follow-up in 2 weeks.',
    notes: 'Patient reports pain during physical activity. ECG shows no acute changes.',
    is_deleted: false,
    created_at: new Date('2024-11-20'),
    updated_at: new Date('2024-11-20'),
  },
  {
    id: 2,
    global_id: 'VIS002',
    patient_id: 2,
    doctor_id: 1,
    clinic_id: 1,
    chief_complaint: 'High blood sugar levels',
    vitals: {
      weight: 68,
      height: 162,
    },
    diagnosis: 'Uncontrolled Type 2 Diabetes Mellitus',
    treatment_plan: 'Adjust Metformin to 1000mg twice daily. Referred to nutritionist.',
    notes: 'HbA1c: 8.5%. Need better glycemic control.',
    is_deleted: false,
    created_at: new Date('2024-11-22'),
    updated_at: new Date('2024-11-22'),
  },
];

// Initialize mock labs
const initLabs = (): Lab[] => [
  {
    id: 1,
    global_id: 'LAB001',
    patient_id: 1,
    doctor_id: 1,
    name: 'Complete Blood Count',
    test_date: new Date('2024-11-20'),
    comments: 'WBC: 7.5, RBC: 4.8, Hemoglobin: 14.2 g/dL - All within normal range',
    is_deleted: false,
    created_at: new Date('2024-11-20'),
  },
  {
    id: 2,
    global_id: 'LAB002',
    patient_id: 2,
    doctor_id: 1,
    name: 'HbA1c Test',
    test_date: new Date('2024-11-22'),
    comments: 'HbA1c: 8.5% - Above target range',
    is_deleted: false,
    created_at: new Date('2024-11-22'),
  },
];

// Initialize mock scans
const initScans = (): Scan[] => [
  {
    id: 1,
    global_id: 'SCN001',
    patient_id: 1,
    doctor_id: 1,
    name: 'Chest X-Ray',
    type: ScanType.X_RAY,
    comments: 'Normal sinus rhythm. No ST-segment changes. No acute ischemic changes detected.',
    is_deleted: false,
    created_at: new Date('2024-11-20'),
  },
];

// Initialize mock medications
const initMedications = (): Medication[] => [
  {
    id: 1,
    global_id: 'MED001',
    patient_id: 1,
    doctor_id: 1,
    name: 'Aspirin',
    dosage: MedicationDosage.ONCE_PER_DAY,
    period: MedicationPeriod.ONE_DAY,
    is_deleted: false,
    created_at: new Date('2024-11-20'),
  },
  {
    id: 2,
    global_id: 'MED002',
    patient_id: 1,
    doctor_id: 1,
    name: 'Nitroglycerin',
    dosage: MedicationDosage.ONCE_PER_DAY,
    period: MedicationPeriod.CHRONIC,
    is_deleted: false,
    created_at: new Date('2024-11-20'),
  },
  {
    id: 3,
    global_id: 'MED003',
    patient_id: 2,
    doctor_id: 1,
    name: 'Metformin',
    dosage: MedicationDosage.TWICE_PER_DAY,
    period: MedicationPeriod.ONE_WEEK,
    is_deleted: false,
    created_at: new Date('2024-11-22'),
  },
];

// Initialize all mock data (only if not already initialized)
export const initMockData = () => {
  if (typeof window === 'undefined') return;

  console.log('🔍 initMockData - Starting initialization...');

  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    console.log('🔍 initMockData - Initializing USERS');
    setStorageData(STORAGE_KEYS.USERS, initUsers());
  }
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    console.log('🔍 initMockData - Initializing PATIENTS');
    setStorageData(STORAGE_KEYS.PATIENTS, initPatients());
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLINICS)) {
    console.log('🔍 initMockData - Initializing CLINICS');
    setStorageData(STORAGE_KEYS.CLINICS, initClinics());
  }
  if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
    console.log('🔍 initMockData - Initializing VISITS');
    setStorageData(STORAGE_KEYS.VISITS, initVisits());
  }
  if (!localStorage.getItem(STORAGE_KEYS.LABS)) {
    console.log('🔍 initMockData - Initializing LABS');
    setStorageData(STORAGE_KEYS.LABS, initLabs());
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCANS)) {
    console.log('🔍 initMockData - Initializing SCANS');
    setStorageData(STORAGE_KEYS.SCANS, initScans());
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) {
    console.log('🔍 initMockData - Initializing MEDICATIONS');
    setStorageData(STORAGE_KEYS.MEDICATIONS, initMedications());
  }

  console.log('🔍 initMockData - Initialization complete!');
};

// Reset all mock data (for testing/development)
export const resetMockData = () => {
  if (typeof window === 'undefined') return;
  
  setStorageData(STORAGE_KEYS.USERS, initUsers());
  setStorageData(STORAGE_KEYS.PATIENTS, initPatients());
  setStorageData(STORAGE_KEYS.CLINICS, initClinics());
  setStorageData(STORAGE_KEYS.VISITS, initVisits());
  setStorageData(STORAGE_KEYS.LABS, initLabs());
  setStorageData(STORAGE_KEYS.SCANS, initScans());
  setStorageData(STORAGE_KEYS.MEDICATIONS, initMedications());
};

// Mock API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthAPI = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    const user = users.find((u) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    return {
      user: {
        id: user.id,
        global_id: user.global_id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: new Date().toISOString(),
      },
      token: 'mock_token_' + user.id,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay();
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    
    // Check if email exists
    if (users.find((u) => u.email === data.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: users.length + 1,
      global_id: `${data.role === UserRole.DOCTOR ? 'DOC' : 'ADM'}${String(users.length + 1).padStart(3, '0')}`,
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role as UserRole,
      ...(data.role === UserRole.DOCTOR ? {
        specialization: data.specialization,
        license_number: data.license_number,
        phone_number: data.phone_number,
        clinic_id: data.clinic_id,
      } : {}),
    };

    users.push(newUser as typeof users[0]);
    setStorageData(STORAGE_KEYS.USERS, users);

    return {
      user: {
        id: newUser.id,
        global_id: newUser.global_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        created_at: new Date().toISOString(),
      },
      token: 'mock_token_' + newUser.id,
    };
  },
};

// Mock Clinics API
export const mockClinicsAPI = {
  async getClinics(): Promise<Clinic[]> {
    await delay();
    return getStorageData(STORAGE_KEYS.CLINICS, initClinics());
  },

  async getClinicsWithStats(): Promise<ClinicWithStats[]> {
    await delay();
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());

    return clinics.map((clinic: Clinic) => ({
      ...clinic,
      doctor_count: users.filter((u) => 'clinic_id' in u && u.clinic_id === clinic.id).length,
      patient_count: Math.floor(Math.random() * 50) + 10,
      today_visits: Math.floor(Math.random() * 20) + 5,
    }));
  },

  async createClinic(data: Omit<Clinic, 'id' | 'global_id' | 'is_deleted' | 'created_at' | 'updated_at'>): Promise<Clinic> {
    await delay();
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const newClinic: Clinic = {
      id: clinics.length + 1,
      global_id: `CLI${String(clinics.length + 1).padStart(3, '0')}`,
      ...data,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    clinics.push(newClinic);
    setStorageData(STORAGE_KEYS.CLINICS, clinics);
    return newClinic;
  },

  async updateClinic(id: number, data: Partial<Clinic>): Promise<Clinic> {
    await delay();
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const index = clinics.findIndex((c: Clinic) => c.id === id);
    if (index === -1) throw new Error('Clinic not found');
    
    clinics[index] = { ...clinics[index], ...data, updated_at: new Date() };
    setStorageData(STORAGE_KEYS.CLINICS, clinics);
    return clinics[index];
  },

  async deleteClinic(id: number): Promise<void> {
    await delay();
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const filtered = clinics.filter((c: Clinic) => c.id !== id);
    setStorageData(STORAGE_KEYS.CLINICS, filtered);
  },
};


// Mock Doctors API
export const mockDoctorsAPI = {
  async getDoctors(): Promise<DoctorWithClinic[]> {
    await delay();
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    
    const doctors = users.filter((u) => u.role === UserRole.DOCTOR);
    
    return doctors.map((doc): DoctorWithClinic => {
      const clinic = clinics.find((c: Clinic) => c.id === doc.clinic_id);
      return {
        id: doc.id,
        global_id: doc.global_id,
        username: doc.username,
        email: doc.email,
        role: doc.role,
        specialization: doc.specialization || 'General Medicine',
        license_number: doc.license_number || 'N/A',
        clinic_id: doc.clinic_id || 0,
        phone_number: doc.phone_number || '',
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        years_of_experience: 'years_of_experience' in doc ? doc.years_of_experience as number : undefined,
        clinic: clinic ? {
          id: clinic.id,
          name: clinic.name,
          department: clinic.department,
        } : { id: 0, name: 'Unknown', department: 'Unknown' },
      };
    });
  },

  async deleteDoctor(id: number): Promise<void> {
    await delay();
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    const filtered = users.filter((u) => u.id !== id);
    setStorageData(STORAGE_KEYS.USERS, filtered);
  },
};

// Mock Visits API
export const mockVisitsAPI = {
  async getPatientVisits(socialSecurityNumber: string): Promise<VisitWithRelations[]> {
    console.log('🔍 mockVisitsAPI.getPatientVisits called with SSN:', socialSecurityNumber);
    await delay();

    const patientId = await getPatientIdFromSSN(socialSecurityNumber);
    console.log('🔍 Mapped SSN to patientId:', patientId);

    const visits = getStorageData(STORAGE_KEYS.VISITS, initVisits());
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const patients = getStorageData(STORAGE_KEYS.PATIENTS, initPatients());

    const patientVisits = visits.filter((v: Visit) => v.patient_id === patientId);
    const patient = patients.find((p: Patient) => p.id === patientId);
    
    return patientVisits.map((visit: Visit) => {
      const doctor = users.find((u) => u.id === visit.doctor_id);
      const clinic = clinics.find((c: Clinic) => c.id === visit.clinic_id);
      
      return {
        ...visit,
        patient: patient || {
          id: 0,
          global_id: 'UNKNOWN',
          name: 'Unknown Patient',
          national_id: 0,
          gender: Gender.MALE,
          birthdate: new Date(),
          phone_number: '',
          email: '',
          address: '',
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        } as Patient,
        doctor: doctor ? {
          id: doctor.id,
          global_id: doctor.global_id,
          username: doctor.username,
          email: doctor.email,
          role: doctor.role,
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          clinic_id: doctor.clinic_id,
          phone_number: doctor.phone_number,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        } as Doctor : {} as Doctor,
        clinic: clinic ? {
          id: clinic.id,
          name: clinic.name,
          department: clinic.department,
        } : { id: 0, name: 'Unknown', department: 'Unknown' },
      };
    });
  },

  async createVisit(data: Omit<Visit, 'id' | 'global_id' | 'is_deleted' | 'created_at' | 'updated_at'>): Promise<Visit> {
    await delay();
    const visits = getStorageData(STORAGE_KEYS.VISITS, initVisits());
    const newVisit: Visit = {
      id: visits.length + 1,
      global_id: `VIS${String(visits.length + 1).padStart(3, '0')}`,
      ...data,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    visits.push(newVisit);
    setStorageData(STORAGE_KEYS.VISITS, visits);
    return newVisit;
  },

  async getTodayVisits(): Promise<Visit[]> {
    await delay();
    const visits = getStorageData(STORAGE_KEYS.VISITS, initVisits());
    const today = new Date();
    return visits.filter((v: Visit) => {
      const visitDate = new Date(v.created_at);
      return (
        visitDate.getDate() === today.getDate() &&
        visitDate.getMonth() === today.getMonth() &&
        visitDate.getFullYear() === today.getFullYear()
      );
    });
  },

  async getRecentVisits(limit: number = 10): Promise<VisitWithRelations[]> {
    await delay();
    const visits = getStorageData(STORAGE_KEYS.VISITS, initVisits());
    const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
    const clinics = getStorageData(STORAGE_KEYS.CLINICS, initClinics());
    const patients = getStorageData(STORAGE_KEYS.PATIENTS, initPatients());
    
    // Sort by created_at descending and take limit
    const recentVisits = [...visits]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return recentVisits.map((visit: Visit) => {
      const doctor = users.find((u) => u.id === visit.doctor_id);
      const clinic = clinics.find((c: Clinic) => c.id === visit.clinic_id);
      const patient = patients.find((p: Patient) => p.id === visit.patient_id);
      
      return {
        ...visit,
        patient: patient || {
          id: 0,
          global_id: 'UNKNOWN',
          name: 'Unknown Patient',
          national_id: 0,
          gender: Gender.MALE,
          birthdate: new Date(),
          phone_number: '',
          email: '',
          address: '',
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        } as Patient,
        doctor: doctor ? {
          id: doctor.id,
          global_id: doctor.global_id,
          username: doctor.username,
          email: doctor.email,
          role: doctor.role,
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          clinic_id: doctor.clinic_id,
          phone_number: doctor.phone_number,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        } as Doctor : {} as Doctor,
        clinic: clinic ? {
          id: clinic.id,
          name: clinic.name,
          department: clinic.department,
        } : { id: 0, name: 'Unknown', department: 'Unknown' },
      };
    });
  },
};

// Helper function to get patientId from socialSecurityNumber
async function getPatientIdFromSSN(socialSecurityNumber: string): Promise<number> {
  // Try to find the patient by SSN
  const patients = getStorageData(STORAGE_KEYS.PATIENTS, initPatients());
  const patient = patients.find((p: Patient) => String(p?.national_id) === socialSecurityNumber);

  if (patient) {
    console.log('🔍 Found patient by SSN:', patient);
    return patient.id;
  }

  // Fallback: try to extract ID from SSN (for demo purposes)
  // The SSN format is YYMMDDXXXXXXX where the middle digits might indicate something
  // For demo, we'll use a simple mapping
  console.log('⚠️ Could not find patient by SSN, using fallback mapping');
  const lastDigit = parseInt(socialSecurityNumber.slice(-1));
  return (lastDigit % 3) + 1; // Distribute across 1-3
}

// Mock Medical History API
export const mockMedicalHistoryAPI = {
  async getPatientLabs(socialSecurityNumber: string): Promise<Lab[]> {
    console.log('🔍 mockMedicalHistoryAPI.getPatientLabs called with SSN:', socialSecurityNumber);
    await delay();
    const patientId = await getPatientIdFromSSN(socialSecurityNumber);
    console.log('🔍 Mapped SSN to patientId:', patientId);

    const labs = getStorageData(STORAGE_KEYS.LABS, initLabs());
    console.log('🔍 mockMedicalHistoryAPI.getPatientLabs - all labs:', labs);
    const filtered = labs.filter((l: Lab) => l.patient_id === patientId);
    console.log('🔍 mockMedicalHistoryAPI.getPatientLabs - filtered result:', filtered);
    return filtered;
  },

  async getPatientScans(socialSecurityNumber: string): Promise<Scan[]> {
    console.log('🔍 mockMedicalHistoryAPI.getPatientScans called with SSN:', socialSecurityNumber);
    await delay();
    const patientId = await getPatientIdFromSSN(socialSecurityNumber);
    console.log('🔍 Mapped SSN to patientId:', patientId);

    const scans = getStorageData(STORAGE_KEYS.SCANS, initScans());
    console.log('🔍 mockMedicalHistoryAPI.getPatientScans - all scans:', scans);
    const filtered = scans.filter((s: Scan) => s.patient_id === patientId);
    console.log('🔍 mockMedicalHistoryAPI.getPatientScans - filtered result:', filtered);
    return filtered;
  },

  async getPatientMedications(socialSecurityNumber: string): Promise<Medication[]> {
    console.log('🔍 mockMedicalHistoryAPI.getPatientMedications called with SSN:', socialSecurityNumber);
    await delay();
    const patientId = await getPatientIdFromSSN(socialSecurityNumber);
    console.log('🔍 Mapped SSN to patientId:', patientId);

    const medications = getStorageData(STORAGE_KEYS.MEDICATIONS, initMedications());
    console.log('🔍 mockMedicalHistoryAPI.getPatientMedications - all medications:', medications);
    const filtered = medications.filter((m: Medication) => m.patient_id === patientId);
    console.log('🔍 mockMedicalHistoryAPI.getPatientMedications - filtered result:', filtered);
    return filtered;
  },
};
