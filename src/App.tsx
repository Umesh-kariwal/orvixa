import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeProvider';
import { router } from '@/router';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
