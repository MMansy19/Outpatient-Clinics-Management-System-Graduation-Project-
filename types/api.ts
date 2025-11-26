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
