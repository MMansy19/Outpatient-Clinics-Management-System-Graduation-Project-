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
    labs: [
      {
        name: 'Complete Blood Count (CBC)',
        photoUrl: '/labs/cbc-results-2025-01-10.jpg',
        comments: 'All values within normal range',
        doctor: {
          name: 'Dr. Nadia Ibrahim',
          speciality: 'Laboratory Medicine',
        },
        createdAt: new Date('2025-01-10'),
      },
      {
        name: 'Liver Function Test (LFT)',
        photoUrl: '/labs/lft-results-2024-12-15.jpg',
        comments: 'Slightly elevated ALT levels, recommend follow-up',
        doctor: {
          name: 'Dr. Omar Farouk',
          speciality: 'Laboratory Medicine',
        },
        createdAt: new Date('2024-12-15'),
      },
      {
        name: 'Lipid Profile',
        photoUrl: '/labs/lipid-results-2024-11-20.jpg',
        comments: 'Cholesterol levels slightly high, diet modification advised',
        doctor: {
          name: 'Dr. Nadia Ibrahim',
          speciality: 'Laboratory Medicine',
        },
        createdAt: new Date('2024-11-20'),
      },
    ],
  };

  return NextResponse.json(response);
}
