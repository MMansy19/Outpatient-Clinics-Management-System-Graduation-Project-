'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { apiClient } from '@/lib/api/client';

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

  const [visitDiagnoses, setVisitDiagnoses] = useState(
    'Common cold, Rest for 3 days, Panadol 500mg twice daily'
  );
  const [visitPatientId, setVisitPatientId] = useState('');

  const [medicationName, setMedicationName] = useState('Panadol');
  const [medicationDosage, setMedicationDosage] = useState(2);
  const [medicationPeriod, setMedicationPeriod] = useState(7);
  const [medicationComments, setMedicationComments] =
    useState('Take with food');
  const [medicationPatientId, setMedicationPatientId] = useState('');

  // Admin pagination
  const [adminPage, setAdminPage] = useState(1);
  const [adminLimit, setAdminLimit] = useState(10);

  // Update patient
  const [updatePatientId, setUpdatePatientId] = useState('');
  const [updateFirstName, setUpdateFirstName] = useState('Mahmoud');
  const [updateLastName, setUpdateLastName] = useState('Abdelfatah');
  const [updateJob, setUpdateJob] = useState('Frontend Engineer');
  const [updateAddress, setUpdateAddress] = useState('Cairo, Egypt');

  const handleApiCall = async (
    apiFunction: () => Promise<unknown>,
    testName: string
  ) => {
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
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error';
      setError(errorMessage);
      toast.error(`${testName} - Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Test functions
  const testGatewayStatus = () =>
    handleApiCall(() => apiClient.get('/'), 'Gateway Status Check');

  const testAuthStatus = () =>
    handleApiCall(() => authApi.isUp(), 'Auth Service Status');

  const testAdminStatus = () =>
    handleApiCall(() => superAdminApi.isUp(), 'Admin Service Status');

  const testLogin = () =>
    handleApiCall(
      () => authApi.login({ email: loginEmail, password: loginPassword }),
      'User Login'
    );

  const testCreatePatient = () =>
    handleApiCall(
      () =>
        authApi.createPatient({
          firstName: patientFirstName,
          lastName: patientLastName,
          language: 1,
          socialSecurityNumber: patientNationalId,
          address: patientAddress,
          job: patientJob,
        }),
      'Create Patient'
    );

  const testCreateVisit = () =>
    handleApiCall(
      () =>
        doctorApi.createVisit({
          diagnoses: visitDiagnoses,
          patientId: visitPatientId,
        }),
      'Create Visit'
    );

  const testCreateMedication = () =>
    handleApiCall(
      () =>
        doctorApi.createMedication({
          name: medicationName,
          dosage: String(medicationDosage),
          period: String(medicationPeriod),
          comments: medicationComments,
          patientId: medicationPatientId,
        }),
      'Create Medication'
    );

  const testGetDoctors = () =>
    handleApiCall(
      () => superAdminApi.getDoctors({ page: adminPage, limit: adminLimit }),
      'Get All Doctors'
    );

  const testGetPatients = () =>
    handleApiCall(
      () => superAdminApi.getPatients({ page: adminPage, limit: adminLimit }),
      'Get All Patients'
    );

  const testGetVisits = () =>
    handleApiCall(
      () => superAdminApi.getVisits({ page: adminPage, limit: adminLimit }),
      'Get All Visits'
    );

  const testUpdatePatient = () =>
    handleApiCall(
      () =>
        superAdminApi.updatePatient(updatePatientId, {
          firstName: updateFirstName,
          lastName: updateLastName,
          job: updateJob,
          address: updateAddress,
        }),
      'Update Patient'
    );

  const testGetVisitsData = () =>
    handleApiCall(
      () => apiClient.get('/visits'),
      'Get Visits Data'
    );

  const testGetLabsData = () =>
    handleApiCall(
      () => apiClient.get('/labs'),
      'Get Labs Data'
    );

  const testGetScansData = () =>
    handleApiCall(
      () => apiClient.get('/scans'),
      'Get Scans Data'
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar locale={locale} />

      <div className="container mx-auto px-4 max-w-6xl pt-20">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            API Integration Testing
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Test backend endpoints to verify integration. Open DevTools (F12) to
            see network requests.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="text-xs sm:text-sm break-all">
              <span className="font-semibold">API URL:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'}
              </code>
            </div>
          </div>
        </div>

        <Tabs defaultValue="gateway" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex md:space-x-2 space-x-1">
              <TabsTrigger value="gateway" className="flex-shrink-0">
                🚀 Gateway
              </TabsTrigger>
              <TabsTrigger value="auth" className="flex-shrink-0">
                🔐 Auth
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex-shrink-0">
                ⚙️ Admin
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex-shrink-0">
                👨‍⚕️ Doctor
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Gateway Tests */}
          <TabsContent value="gateway">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Gateway Status Tests</CardTitle>
                <CardDescription>
                  Test if the API Gateway and services are running
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={testGatewayStatus}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Test Gateway (GET /api/v1)
                  </Button>
                  <Button
                    onClick={testAuthStatus}
                    disabled={loading}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Test Auth Service
                  </Button>
                  <Button
                    onClick={testAdminStatus}
                    disabled={loading}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Test Admin Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auth Tests */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>🔐 Authentication Tests</CardTitle>
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
                <Button
                  onClick={testLogin}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Testing...' : 'Test Login'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tests with Nested Tabs */}
          <TabsContent value="admin">
            <Tabs defaultValue="admin-create-admin" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex md:space-x-2 space-x-1">
                  <TabsTrigger value="admin-create-admin" className="flex-shrink-0 text-xs">
                    Create Admin
                  </TabsTrigger>
                  <TabsTrigger value="admin-create-doctor" className="flex-shrink-0 text-xs">
                    Create Doctor
                  </TabsTrigger>
                  <TabsTrigger value="admin-create-patient" className="flex-shrink-0 text-xs">
                    Create Patient
                  </TabsTrigger>
                  <TabsTrigger value="admin-status" className="flex-shrink-0 text-xs">
                    Admin Status
                  </TabsTrigger>
                  <TabsTrigger value="admin-doctors" className="flex-shrink-0 text-xs">
                    Get Doctors
                  </TabsTrigger>
                  <TabsTrigger value="admin-patients" className="flex-shrink-0 text-xs">
                    Get Patients
                  </TabsTrigger>
                  <TabsTrigger value="admin-visits" className="flex-shrink-0 text-xs">
                    Get Visits
                  </TabsTrigger>
                  <TabsTrigger value="admin-update-patient" className="flex-shrink-0 text-xs">
                    Update Patient
                  </TabsTrigger>
                  <TabsTrigger value="admin-clinic" className="flex-shrink-0 text-xs">
                    Clinic
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Create Admin */}
              <TabsContent value="admin-create-admin">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Admin</CardTitle>
                    <CardDescription>POST /api/v1/auth/admin/create</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 This endpoint requires super admin authentication.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => toast.info('Admin creation endpoint - Implement as needed')}
                      disabled={loading}
                      className="w-full"
                    >
                      Test Create Admin
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Create Doctor */}
              <TabsContent value="admin-create-doctor">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Doctor</CardTitle>
                    <CardDescription>POST /api/v1/auth/doctor/create</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 This endpoint requires admin authentication.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => toast.info('Doctor creation endpoint - Implement as needed')}
                      disabled={loading}
                      className="w-full"
                    >
                      Test Create Doctor
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Create Patient */}
              <TabsContent value="admin-create-patient">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Patient</CardTitle>
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
                    <Button
                      onClick={testCreatePatient}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Test Create Patient'}
                    </Button>
                    <Alert>
                      <AlertDescription>
                        💡 After creating a patient, copy the returned UUID to use
                        in other tests
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Status */}
              <TabsContent value="admin-status">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Status</CardTitle>
                    <CardDescription>GET /api/v1/super-admin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 These endpoints require authentication.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => handleApiCall(() => superAdminApi.isUp(), 'Admin Status')}
                      disabled={loading}
                      className="w-full"
                    >
                      Test Admin Status
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Get Doctors */}
              <TabsContent value="admin-doctors">
                <Card>
                  <CardHeader>
                    <CardTitle>Get All Doctors</CardTitle>
                    <CardDescription>GET /api/v1/super-admin/doctors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adminPage">Page Number</Label>
                        <Input
                          id="adminPage"
                          type="number"
                          min="1"
                          value={adminPage}
                          onChange={(e) => setAdminPage(parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminLimit">Items Per Page</Label>
                        <Input
                          id="adminLimit"
                          type="number"
                          min="1"
                          max="100"
                          value={adminLimit}
                          onChange={(e) => setAdminLimit(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={testGetDoctors}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'GET /api/v1/super-admin/doctors'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Get Patients */}
              <TabsContent value="admin-patients">
                <Card>
                  <CardHeader>
                    <CardTitle>Get All Patients</CardTitle>
                    <CardDescription>GET /api/v1/super-admin/patients</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adminPage2">Page Number</Label>
                        <Input
                          id="adminPage2"
                          type="number"
                          min="1"
                          value={adminPage}
                          onChange={(e) => setAdminPage(parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminLimit2">Items Per Page</Label>
                        <Input
                          id="adminLimit2"
                          type="number"
                          min="1"
                          max="100"
                          value={adminLimit}
                          onChange={(e) => setAdminLimit(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={testGetPatients}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'GET /api/v1/super-admin/patients'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Get Visits */}
              <TabsContent value="admin-visits">
                <Card>
                  <CardHeader>
                    <CardTitle>Get All Visits</CardTitle>
                    <CardDescription>GET /api/v1/super-admin/visits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adminPage3">Page Number</Label>
                        <Input
                          id="adminPage3"
                          type="number"
                          min="1"
                          value={adminPage}
                          onChange={(e) => setAdminPage(parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminLimit3">Items Per Page</Label>
                        <Input
                          id="adminLimit3"
                          type="number"
                          min="1"
                          max="100"
                          value={adminLimit}
                          onChange={(e) => setAdminLimit(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={testGetVisits}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'GET /api/v1/super-admin/visits'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Update Patient */}
              <TabsContent value="admin-update-patient">
                <Card>
                  <CardHeader>
                    <CardTitle>Update Patient</CardTitle>
                    <CardDescription>PATCH /api/v1/super-admin/patient/{'{id}'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 This endpoint requires admin authentication.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="updatePatientId">Patient UUID</Label>
                      <Input
                        id="updatePatientId"
                        value={updatePatientId}
                        onChange={(e) => setUpdatePatientId(e.target.value)}
                        placeholder="0281ba4f-7592-477e-9d02-f2641aa89221"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="updateFirstName">First Name</Label>
                        <Input
                          id="updateFirstName"
                          value={updateFirstName}
                          onChange={(e) => setUpdateFirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="updateLastName">Last Name</Label>
                        <Input
                          id="updateLastName"
                          value={updateLastName}
                          onChange={(e) => setUpdateLastName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="updateJob">Job</Label>
                        <Input
                          id="updateJob"
                          value={updateJob}
                          onChange={(e) => setUpdateJob(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="updateAddress">Address</Label>
                        <Input
                          id="updateAddress"
                          value={updateAddress}
                          onChange={(e) => setUpdateAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={testUpdatePatient}
                      disabled={loading || !updatePatientId}
                      className="w-full"
                    >
                      {loading ? 'Updating...' : 'Test Update Patient'}
                    </Button>

                    <Alert>
                      <AlertDescription>
                        💡 Get a patient ID from the Get Patients tab
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clinic */}
              <TabsContent value="admin-clinic">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinic Management</CardTitle>
                    <CardDescription>POST /api/v1/super-admin/clinic</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 This endpoint requires admin authentication.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => toast.info('Clinic endpoint - Implement as needed')}
                      disabled={loading}
                      className="w-full"
                    >
                      Test Create Clinic
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Doctor Tests with Nested Tabs */}
          <TabsContent value="doctor">
            <Tabs defaultValue="doctor-status" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex md:space-x-2 space-x-1">
                  <TabsTrigger value="doctor-status" className="flex-shrink-0 text-xs">
                    Doctor Status
                  </TabsTrigger>
                  <TabsTrigger value="doctor-visit" className="flex-shrink-0 text-xs">
                    Create Visit
                  </TabsTrigger>
                  <TabsTrigger value="doctor-medication" className="flex-shrink-0 text-xs">
                    Create Med
                  </TabsTrigger>
                  <TabsTrigger value="doctor-visits-data" className="flex-shrink-0 text-xs">
                    Visits Data
                  </TabsTrigger>
                  <TabsTrigger value="doctor-medications-data" className="flex-shrink-0 text-xs">
                    Meds Data
                  </TabsTrigger>
                  <TabsTrigger value="doctor-scans-data" className="flex-shrink-0 text-xs">
                    Scans Data
                  </TabsTrigger>
                  <TabsTrigger value="doctor-labs-data" className="flex-shrink-0 text-xs">
                    Labs Data
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Doctor Status */}
              <TabsContent value="doctor-status">
                <Card>
                  <CardHeader>
                    <CardTitle>Doctor Status</CardTitle>
                    <CardDescription>GET /api/v1/doctor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔐 These endpoints require doctor authentication.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => handleApiCall(() => doctorApi.isUp(), 'Doctor Status')}
                      disabled={loading}
                      className="w-full"
                    >
                      Test Doctor Status
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Create Visit */}
              <TabsContent value="doctor-visit">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Visit</CardTitle>
                    <CardDescription>POST /api/v1/doctor/visit/create</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="visitPatientId">Patient UUID</Label>
                      <Input
                        id="visitPatientId"
                        value={visitPatientId}
                        onChange={(e) => setVisitPatientId(e.target.value)}
                        placeholder="0281ba4f-7592-477e-9d02-f2641aa89221"
                      />
                    </div>
                    <div>
                      <Label htmlFor="diagnoses">Diagnoses</Label>
                      <Textarea
                        id="diagnoses"
                        value={visitDiagnoses}
                        onChange={(e) => setVisitDiagnoses(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={testCreateVisit}
                      disabled={loading || !visitPatientId}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Test Create Visit'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Create Medication */}
              <TabsContent value="doctor-medication">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Medication</CardTitle>
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
                        <Label htmlFor="dosage">Dosage</Label>
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
                        <Label htmlFor="comments">Comments</Label>
                        <Input
                          id="comments"
                          value={medicationComments}
                          onChange={(e) => setMedicationComments(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={testCreateMedication}
                      disabled={loading || !medicationPatientId}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Test Create Medication'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Visits Data */}
              <TabsContent value="doctor-visits-data">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Patient Visits</CardTitle>
                    <CardDescription>GET /api/v1/doctor/patient/{'{ssn}'}/visits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        📋 This endpoint returns patient visits with clinic data.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={testGetVisitsData}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'Test Get Visits Data'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Data */}
              <TabsContent value="doctor-medications-data">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Patient Medications</CardTitle>
                    <CardDescription>GET /api/v1/doctor/patient/{'{ssn}'}/medications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        💊 This endpoint returns patient medications.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => handleApiCall(() => apiClient.get('/medications'), 'Get Medications')}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'Test Get Medications'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scans Data */}
              <TabsContent value="doctor-scans-data">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Patient Scans</CardTitle>
                    <CardDescription>GET /api/v1/doctor/patient/{'{ssn}'}/scans</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🔬 This endpoint returns patient scan results.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={testGetScansData}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'Test Get Scans Data'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Labs Data */}
              <TabsContent value="doctor-labs-data">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Patient Labs</CardTitle>
                    <CardDescription>GET /api/v1/doctor/patient/{'{ssn}'}/labs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        🧪 This endpoint returns patient lab test results.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={testGetLabsData}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Loading...' : 'Test Get Labs Data'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        {(result || error) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {error ? '❌ Error Response' : '✅ Success Response'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-2 sm:p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 text-xs sm:text-sm">
                {JSON.stringify(error || result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
