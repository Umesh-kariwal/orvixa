import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={cycleTheme}
      title={`Current theme: ${theme}. Click to switch.`}
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun size={16} style={{ marginRight: '6px' }} />}
      {theme === 'dark' && <Moon size={16} style={{ marginRight: '6px' }} />}
      {theme === 'system' && <Monitor size={16} style={{ marginRight: '6px' }} />}
      <span style={{ textTransform: 'capitalize' }}>{theme}</span>
    </Button>
  );
};
