import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CopilotHomeView } from '@/views/CopilotHomeView';
import { DesignSystemDemoView } from '@/views/DesignSystemDemoView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
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
