export interface SearchFilters {
  query?: string; // Searches name, national_id, email, phone
  period?: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
  clinicId?: number;
  gender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  nationalId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  specialization?: string;
  license_number?: string;
  clinic_id?: number;
  phone_number?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    global_id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
  };
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface CreatePatientRequest {
  national_id: number;
  name: string;
  gender: 'male' | 'female';
  birthdate: Date;
  phone_number?: string;
  email?: string;
  address?: string;
}
