'use client';

import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <ShieldX className="h-20 w-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Unauthorized
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You do not have permission to access this page.
          {user?.name && (
            <span className="block mt-1 text-sm">
              Logged in as <strong>{user.name}</strong>
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
