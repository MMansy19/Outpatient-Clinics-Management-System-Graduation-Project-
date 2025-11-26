export interface User {
  id: number;
  global_id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export type UserPublic = Omit<User, 'password_hash'>;
