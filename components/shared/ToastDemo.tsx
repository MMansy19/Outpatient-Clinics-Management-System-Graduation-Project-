'use client';

import { Button } from '@/components/ui/button';
import { toast, toastMessages } from '@/lib/utils/toast';

/**
 * Toast Demo Component
 * Use this to test and preview all toast notification styles
 * Add this to any page for testing purposes
 */
export function ToastDemo() {
  const handleSuccess = () => {
    toast.success(
      toastMessages.auth.loginSuccess,
      toastMessages.auth.loginSuccessDescription
    );
  };

  const handleError = () => {
    toast.error(
      toastMessages.auth.loginError,
      toastMessages.auth.loginErrorDescription
    );
  };

  const handleWarning = () => {
    toast.warning(
      toastMessages.patient.alreadyExists,
      toastMessages.patient.alreadyExistsDescription
    );
  };

  const handleInfo = () => {
    toast.info(
      'ℹ️ Information',
      'This is an informational message with important details.'
    );
  };

  const handleLoading = () => {
    const loadingToast = toast.loading('Processing your request...');
    
    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Operation completed!', 'Your request was processed successfully.');
    }, 3000);
  };

  const handlePromise = () => {
    const fakeApiCall = new Promise<{ name: string }>((resolve) => {
      setTimeout(() => resolve({ name: 'Dr. John Smith' }), 2000);
    });

    toast.promise(fakeApiCall, {
      loading: '⏳ Creating doctor...',
      success: (data) => `✅ ${data.name} created successfully!`,
      error: '❌ Failed to create doctor',
    });
  };

  const handleDoctorCreated = () => {
    toast.success(
      toastMessages.doctor.createSuccess,
      toastMessages.doctor.createSuccessDescription('Ahmed Hassan')
    );
  };

  const handlePatientCreated = () => {
    toast.success(
      toastMessages.patient.createSuccess,
      toastMessages.patient.createSuccessDescription('Sara Mohamed')
    );
  };

  const handleNetworkError = () => {
    toast.error(
      toastMessages.network.error,
      toastMessages.network.errorDescription
    );
  };

  const handleMultipleToasts = () => {
    toast.info('First notification', 'Loading data...');
    setTimeout(() => {
      toast.warning('Second notification', 'Still processing...');
    }, 500);
    setTimeout(() => {
      toast.success('Third notification', 'All done!');
    }, 1000);
  };

  return (
    <div className="medical-card max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">🎨 Toast Notification Demo</h2>
          <p className="text-muted-foreground">
            Click the buttons below to test different toast notification styles
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Basic Toast Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={handleSuccess} className="bg-green-600 hover:bg-green-700">
                ✅ Success
              </Button>
              <Button onClick={handleError} variant="destructive">
                ❌ Error
              </Button>
              <Button onClick={handleWarning} className="bg-yellow-600 hover:bg-yellow-700">
                ⚠️ Warning
              </Button>
              <Button onClick={handleInfo} className="bg-blue-600 hover:bg-blue-700">
                ℹ️ Info
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Advanced Toast Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button onClick={handleLoading} variant="outline">
                ⏳ Loading Toast
              </Button>
              <Button onClick={handlePromise} variant="outline">
                🔄 Promise Toast
              </Button>
              <Button onClick={handleMultipleToasts} variant="outline">
                📚 Multiple Toasts
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Application-Specific Toasts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button onClick={handleDoctorCreated} className="bg-medical-primary">
                👨‍⚕️ Doctor Created
              </Button>
              <Button onClick={handlePatientCreated} className="bg-medical-primary">
                🏥 Patient Created
              </Button>
              <Button onClick={handleNetworkError} variant="destructive">
                🌐 Network Error
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">📝 Usage Example</h3>
          <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { toast, toastMessages } from '@/lib/utils/toast';

// Simple toast
toast.success("Success!");

// With description
toast.success(
  toastMessages.doctor.createSuccess,
  toastMessages.doctor.createSuccessDescription("Dr. Smith")
);

// Promise toast
toast.promise(apiCall(), {
  loading: "Creating...",
  success: "Created!",
  error: "Failed!"
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
