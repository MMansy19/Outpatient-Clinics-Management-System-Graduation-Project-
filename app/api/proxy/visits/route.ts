import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data matching the provided structure
  const response = {
    patient: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Ahmed Mohamed Hassan',
      gender: 'MALE',
      dateOfBirth: new Date('1995-01-12'),
      socialSecurityNumber: '29512011234567',
      address: 'Cairo, Egypt',
      job: 'Engineer',
    },
    clinics: [
      {
        id: 'clinic-1',
        name: 'Central Clinic',
        visits: [
          {
            doctor: {
              name: 'Dr. Ahmed Mohamed',
              speciality: 'General Medicine',
            },
            diagnoses: 'Annual Checkup - Patient shows normal health indicators',
            createdAt: new Date('2025-01-15'),
          },
          {
            doctor: {
              name: 'Dr. Sara Hassan',
              speciality: 'Internal Medicine',
            },
            diagnoses: 'Flu symptoms - Prescribed rest and medication',
            createdAt: new Date('2024-12-20'),
          },
        ],
      },
      {
        id: 'clinic-2',
        name: 'Heart Care Center',
        visits: [
          {
            doctor: {
              name: 'Dr. Mahmoud Ali',
              speciality: 'Cardiology',
            },
            diagnoses: 'Routine cardiac checkup - All parameters normal',
            createdAt: new Date('2024-11-10'),
          },
        ],
      },
    ],
  };

  return NextResponse.json(response);
}
