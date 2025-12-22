'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Navbar } from '@/components/landing/Navbar';

// Import API services
import { authApi } from '@/lib/api/auth.service';
import { doctorApi } from '@/lib/api/doctor.service';
import { apiClient } from '@/lib/api/client';

/**
 * API Integration Testing Page
 * 
 * This page helps test all backend endpoints to verify integration.
 * Use this to confirm the backend is working before integrating into main UI.
 */

export default function ApiTestPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Test data states
  const [loginEmail, setLoginEmail] = useState('test@example.com');
  const [loginPassword, setLoginPassword] = useState('TestPassword123!');
  
  const [patientFirstName, setPatientFirstName] = useState('Ahmed');
  const [patientLastName, setPatientLastName] = useState('Mohamed');
  const [patientNationalId, setPatientNationalId] = useState('30202041234567');
  const [patientAddress, setPatientAddress] = useState('Cairo, Egypt');
  const [patientJob, setPatientJob] = useState('Engineer');
  
  const [visitDiagnoses, setVisitDiagnoses] = useState('Common cold, Rest for 3 days, Panadol 500mg twice daily');
  const [visitPatientId, setVisitPatientId] = useState('');
  
  const [medicationName, setMedicationName] = useState('Panadol');
  const [medicationDosage, setMedicationDosage] = useState(2);
  const [medicationPeriod, setMedicationPeriod] = useState(7);
  const [medicationComments, setMedicationComments] = useState('Take with food');
  const [medicationPatientId, setMedicationPatientId] = useState('');

  const handleApiCall = async (apiFunction: () => Promise<unknown>, testName: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`[API Test] Starting: ${testName}`);
      const response = await apiFunction();
      console.log(`[API Test] Success:`, response);
      setResult(response);
      toast.success(`${testName} - Success!`);
    } catch (err: unknown) {
      console.error(`[API Test] Error:`, err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(errorMessage);
      toast.error(`${testName} - Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Test functions
  const testGatewayStatus = () => handleApiCall(
    () => apiClient.get('/'),
    'Gateway Status Check'
  );

  const testAuthStatus = () => handleApiCall(
    () => authApi.isUp(),
    'Auth Service Status'
  );

  const testLogin = () => handleApiCall(
    () => authApi.login({ email: loginEmail, password: loginPassword }),
    'User Login'
  );

  const testCreatePatient = () => handleApiCall(
    () => authApi.createPatient({
      firstName: patientFirstName,
      lastName: patientLastName,
      language: 1, // English
      socialSecurityNumber: patientNationalId,
      address: patientAddress,
      job: patientJob,
    }),
    'Create Patient'
  );

  const testCreateVisit = () => handleApiCall(
    () => doctorApi.createVisit({
      diagnoses: visitDiagnoses,
      patientId: visitPatientId,
    }),
    'Create Visit'
  );

  const testCreateMedication = () => handleApiCall(
    () => doctorApi.createMedication({
      name: medicationName,
      dosage: medicationDosage,
      period: medicationPeriod,
      comments: medicationComments,
      patientId: medicationPatientId,
    }),
    'Create Medication'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar locale={locale} />
      
      <div className="container mx-auto px-4 max-w-6xl pt-20">{/* pt-24 adds spacing below fixed navbar */}
        <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">API Integration Testing</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Test backend endpoints to verify integration. Open DevTools (F12) to see network requests.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="text-xs sm:text-sm break-all">
            <span className="font-semibold">API URL:</span>{' '}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'}
            </code>
          </div>
          <div className="text-xs sm:text-sm break-all">
            <span className="font-semibold">Mock Data:</span>{' '}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'false'}
            </code>
          </div>
        </div>
      </div>

      <Tabs defaultValue="gateway" className="space-y-4">
        <div className="overflow-x-auto">
            <TabsList className="inline-flex md:space-x-2 space-x-1">
            <TabsTrigger value="gateway" className="flex-shrink-0">Gateway</TabsTrigger>
            <TabsTrigger value="auth" className="flex-shrink-0">Auth</TabsTrigger>
            <TabsTrigger value="patient" className="flex-shrink-0">Patient</TabsTrigger>
            <TabsTrigger value="visit" className="flex-shrink-0">Visit</TabsTrigger>
            <TabsTrigger value="medication" className="flex-shrink-0">Medication</TabsTrigger>
          </TabsList>
        </div>

        {/* Gateway Tests */}
        <TabsContent value="gateway">
          <Card>
            <CardHeader>
              <CardTitle>Gateway Status Tests</CardTitle>
              <CardDescription>
                Test if the API Gateway and services are running
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={testGatewayStatus} disabled={loading} className="w-full sm:w-auto">
                  Test Gateway (GET /api/v1)
                </Button>
                <Button onClick={testAuthStatus} disabled={loading} variant="outline" className="w-full sm:w-auto">
                  Test Auth Service (GET /api/v1/auth)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Tests */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
              <CardDescription>POST /api/v1/auth/login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              </div>
              <Button onClick={testLogin} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Testing...' : 'Test Login'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Tests */}
        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <CardTitle>Create Patient Test</CardTitle>
              <CardDescription>POST /api/v1/auth/patient/create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={patientFirstName}
                    onChange={(e) => setPatientFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={patientLastName}
                    onChange={(e) => setPatientLastName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID (14 digits)</Label>
                  <Input
                    id="nationalId"
                    value={patientNationalId}
                    onChange={(e) => setPatientNationalId(e.target.value)}
                    placeholder="30202041234567"
                  />
                </div>
                <div>
                  <Label htmlFor="job">Job</Label>
                  <Input
                    id="job"
                    value={patientJob}
                    onChange={(e) => setPatientJob(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={testCreatePatient} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Creating...' : 'Test Create Patient'}
              </Button>
              <Alert>
                <AlertDescription>
                  💡 After creating a patient, copy the returned UUID to use in Visit/Medication tests
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit Tests */}
        <TabsContent value="visit">
          <Card>
            <CardHeader>
              <CardTitle>Create Visit Test</CardTitle>
              <CardDescription>POST /api/v1/doctor/visit/create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visitPatientId">Patient UUID (from patient creation)</Label>
                <Input
                  id="visitPatientId"
                  value={visitPatientId}
                  onChange={(e) => setVisitPatientId(e.target.value)}
                  placeholder="0281ba4f-7592-477e-9d02-f2641aa89221"
                />
              </div>
              <div>
                <Label htmlFor="diagnoses">Diagnoses & Treatment Plan</Label>
                <Textarea
                  id="diagnoses"
                  value={visitDiagnoses}
                  onChange={(e) => setVisitDiagnoses(e.target.value)}
                  rows={4}
                  placeholder="Common cold, Rest for 3 days, Panadol 500mg"
                />
              </div>
              <Button onClick={testCreateVisit} disabled={loading || !visitPatientId} className="w-full sm:w-auto">
                {loading ? 'Creating...' : 'Test Create Visit'}
              </Button>
              {!visitPatientId && (
                <Alert>
                  <AlertDescription>
                    ⚠️ Enter a patient UUID first (create a patient in the Patient tab)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medication Tests */}
        <TabsContent value="medication">
          <Card>
            <CardHeader>
              <CardTitle>Create Medication Test</CardTitle>
              <CardDescription>POST /api/v1/doctor/medication/create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="medicationPatientId">Patient UUID</Label>
                <Input
                  id="medicationPatientId"
                  value={medicationPatientId}
                  onChange={(e) => setMedicationPatientId(e.target.value)}
                  placeholder="0281ba4f-7592-477e-9d02-f2641aa89221"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medName">Medication Name</Label>
                  <Input
                    id="medName"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage (tablets per dose)</Label>
                  <Input
                    id="dosage"
                    type="number"
                    value={medicationDosage}
                    onChange={(e) => setMedicationDosage(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="period">Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    value={medicationPeriod}
                    onChange={(e) => setMedicationPeriod(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="comments">Comments (optional)</Label>
                  <Input
                    id="comments"
                    value={medicationComments}
                    onChange={(e) => setMedicationComments(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={testCreateMedication} disabled={loading || !medicationPatientId} className="w-full sm:w-auto">
                {loading ? 'Creating...' : 'Test Create Medication'}
              </Button>
              {!medicationPatientId && (
                <Alert>
                  <AlertDescription>
                    ⚠️ Enter a patient UUID first
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {(result || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{error ? '❌ Error Response' : '✅ Success Response'}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-2 sm:p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 text-xs sm:text-sm">
              {JSON.stringify(error || result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📝 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Browser DevTools (F12) and go to Network tab</li>
            <li>Start with Gateway tests to verify backend is reachable</li>
            <li>Test Auth to ensure login works (optional - depends on your test data)</li>
            <li>Create a Patient and copy the returned UUID</li>
            <li>Use the patient UUID to test Visit creation</li>
            <li>Use the patient UUID to test Medication creation</li>
            <li>Check Console tab for detailed logs</li>
            <li>Check Network tab to see actual requests/responses</li>
          </ol>
          <Alert className="mt-4">
            <AlertDescription>
              <strong>Troubleshooting:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>CORS errors → Try using /api/proxy in .env.local</li>
                <li>401 errors → You may need to login first or check authentication</li>
                <li>404 errors → Verify the backend URL is correct</li>
                <li>Network errors → Check if backend server is running</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
