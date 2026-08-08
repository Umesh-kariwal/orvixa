import { createHashRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <AppErrorBoundary />,
  },
]);
