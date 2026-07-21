import { createHashRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CopilotHomeView } from '@/views/CopilotHomeView';
import { DesignSystemDemoView } from '@/views/DesignSystemDemoView';
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: <CopilotHomeView />,
      },
      {
        path: 'demo',
        element: <DesignSystemDemoView />,
      },
    ],
  },
]);
