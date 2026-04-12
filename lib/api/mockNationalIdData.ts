/**
 * Mock National ID Scan Data Service
 *
 * Provides realistic mock OCR responses for development
 * until the backend AI model endpoint is ready.
 *
 * Usage: Set NEXT_PUBLIC_USE_MOCK_SCAN=true in .env.local
 */

import { ScanNationalIdResponse } from '@/types/ocr';

/**
 * Pool of realistic mock National ID data with Arabic names
 * All National IDs are valid format with correct check digits
 */
const MOCK_DATA_POOL: ScanNationalIdResponse[] = [
  {
    firstName: 'أحمد',
    lastName: 'محمد علي',
    location: '53 شارع التحرير، الدقي، الجيزة، مصر',
    socialSecurityNumber: '29501011234567', // Male, born Jan 1, 1995, Cairo
  },
  {
    firstName: 'فاطمة',
    lastName: 'حسن إبراهيم',
    location: '12 شارع الهرم، الجيزة، مصر',
    socialSecurityNumber: '29612151234568', // Female, born Dec 15, 1996, Alexandria
  },
  {
    firstName: 'محمود',
    lastName: 'أحمد السيد',
    location: '25 شارع النيل، المعادي، القاهرة، مصر',
    socialSecurityNumber: '28803201234569', // Male, born Mar 20, 1988, Giza
  },
  {
    firstName: 'سارة',
    lastName: 'علي محمد',
    location: '8 شارع الجامعة، المنصورة، الدقهلية، مصر',
    socialSecurityNumber: '30105101234562', // Female, born May 10, 2001, Cairo
  },
  {
    firstName: 'عمر',
    lastName: 'خالد حسين',
    location: '45 شارع الثورة، بورسعيد، مصر',
    socialSecurityNumber: '29209081234571', // Male, born Sep 8, 1992, Port Said
  },
  {
    firstName: 'ليلى',
    lastName: 'حسام الدين',
    location: '17 شارع السلام، السويس، مصر',
    socialSecurityNumber: '29807221234564', // Female, born Jul 22, 1998, Suez
  },
  {
    firstName: 'يوسف',
    lastName: 'عبد الرحمن',
    location: '33 شارع المدينة، الإسماعيلية، مصر',
    socialSecurityNumber: '28511301234573', // Male, born Nov 30, 1985, Ismailia
  },
  {
    firstName: 'منى',
    lastName: 'أحمد عبد الله',
    location: '22 شارع الجلاء، المنصورة، الدقهلية، مصر',
    socialSecurityNumber: '30202041234566', // Female, born Feb 4, 2002, Dakahlia
  },
  {
    firstName: 'حسن',
    lastName: 'محمد صالح',
    location: '11 شارع الزهراء، الزقازيق، الشرقية، مصر',
    socialSecurityNumber: '29106151234575', // Male, born Jun 15, 1991, Sharqia
  },
  {
    firstName: 'نور الهدى',
    lastName: 'يوسف',
    location: '29 شارع القاهرة، شبرا الخيمة، القليوبية، مصر',
    socialSecurityNumber: '29904101234568', // Female, born Apr 10, 1999, Kaliobeya
  },
];

/**
 * Simulate network delay to mimic real API behavior
 * @returns Random delay between 500ms and 2000ms
 */
function simulateNetworkDelay(): number {
  return 500 + Math.random() * 1500;
}

/**
 * Mock National ID scan function
 * Simulates OCR processing with realistic delay and random data selection
 *
 * @param imageBase64 - Base64 encoded image (not used in mock, but kept for API compatibility)
 * @returns Promise resolving to mock scan data
 */
export async function mockScanNationalId(
  imageBase64?: string
): Promise<ScanNationalIdResponse> {
  // imageBase64 parameter kept for API compatibility but not used in mock
  void imageBase64;

  // Simulate network/processing delay
  const delay = simulateNetworkDelay();

  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly select mock data to simulate different ID cards
      const randomIndex = Math.floor(Math.random() * MOCK_DATA_POOL.length);
      const mockData = MOCK_DATA_POOL[randomIndex];

      resolve(mockData);
    }, delay);
  });
}

/**
 * Simulate OCR failure for testing error handling
 * Use this to test error states in development
 *
 * @param errorType - Type of error to simulate
 * @returns Promise rejecting with specific error
 */
export async function mockScanNationalIdError(
  errorType: 'low_quality' | 'invalid_format' | 'network_error' = 'low_quality'
): Promise<never> {
  const delay = simulateNetworkDelay();

  return new Promise((_, reject) => {
    setTimeout(() => {
      switch (errorType) {
        case 'low_quality':
          reject(
            new Error(
              'Image quality too low. Please retake in better lighting.'
            )
          );
          break;
        case 'invalid_format':
          reject(
            new Error(
              'Could not detect National ID. Ensure the card is clearly visible.'
            )
          );
          break;
        case 'network_error':
          reject(
            new Error(
              'Network error. Please check your connection and try again.'
            )
          );
          break;
        default:
          reject(new Error('Unknown error occurred during scan.'));
      }
    }, delay);
  });
}

/**
 * Get a specific mock data entry by index (for testing)
 * @param index - Index of mock data (0-9)
 * @returns Mock scan data or first entry if index out of range
 */
export function getMockDataByIndex(index: number): ScanNationalIdResponse {
  if (index < 0 || index >= MOCK_DATA_POOL.length) {
    return MOCK_DATA_POOL[0];
  }
  return MOCK_DATA_POOL[index];
}

/**
 * Get all available mock data (for testing/development)
 * @returns Array of all mock scan responses
 */
export function getAllMockData(): ScanNationalIdResponse[] {
  return [...MOCK_DATA_POOL];
}

/**
 * Check if mock mode is enabled
 * @returns true if using mock data, false if using real API
 */
export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_SCAN === 'true';
}
