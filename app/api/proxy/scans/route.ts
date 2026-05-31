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
    scans: [
      {
        name: 'Chest X-Ray',
        photoUrl: '/scans/chest-xray-2025-01-08.jpg',
        comments: 'Clear lungs, no abnormalities detected',
        doctor: {
          name: 'Dr. Karim Mansour',
          speciality: 'Radiology',
        },
        createdAt: new Date('2025-01-08'),
      },
      {
        name: 'Abdominal Ultrasound',
        photoUrl: '/scans/abd-ultrasound-2024-12-01.jpg',
        comments: 'Liver and gallbladder normal, slight fatty liver grade 1',
        doctor: {
          name: 'Dr. Laila Ahmed',
          speciality: 'Radiology',
        },
        createdAt: new Date('2024-12-01'),
      },
      {
        name: 'Brain MRI',
        photoUrl: '/scans/brain-mri-2024-10-15.jpg',
        comments: 'No significant findings, brain structure normal',
        doctor: {
          name: 'Dr. Karim Mansour',
          speciality: 'Radiology',
        },
        createdAt: new Date('2024-10-15'),
      },
    ],
  };

  return NextResponse.json(response);
}
