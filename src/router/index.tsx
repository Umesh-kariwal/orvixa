import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CopilotHomeView } from '@/views/CopilotHomeView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <CopilotHomeView />,
      },
    ],
  },
]);
