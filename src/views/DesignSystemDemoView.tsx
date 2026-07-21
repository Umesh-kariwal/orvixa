import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heading, Text } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Laptop, Sparkles, AlertTriangle, CheckCircle2, BookOpen, Layers } from 'lucide-react';

export const DesignSystemDemoView: React.FC = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '14px',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header & Theme Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <Heading level={1} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers style={{ color: 'var(--brand-primary)' }} size={28} />
            Orvixa Design System Specification
          </Heading>
          <Text variant="secondary">
            Milestone 1 Production Quality Audit & Token Specification Preview
          </Text>
        </div>

        {/* Theme Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Button
            variant={theme === 'light' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            <Sun size={14} style={{ marginRight: '6px' }} /> Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            <Moon size={14} style={{ marginRight: '6px' }} /> Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            <Laptop size={14} style={{ marginRight: '6px' }} /> System ({effectiveTheme})
          </Button>
        </div>
      </div>

      {/* 1. Button Variants & Sizes */}
      <div style={sectionStyle}>
        <Heading level={2}>1. Button Primitives</Heading>
        <Text variant="secondary">Variants: Primary, Glow, Secondary, Outline, Ghost across sizes and disabled states</Text>
        
        <div style={rowStyle}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="glow">
            <Sparkles size={16} style={{ marginRight: '8px' }} /> Glow Variant
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>Disabled State</Button>
        </div>

        <div style={rowStyle}>
          <Button size="sm" variant="primary">Small (sm)</Button>
          <Button size="md" variant="primary">Medium (md)</Button>
          <Button size="lg" variant="primary">Large (lg)</Button>
        </div>
      </div>

      {/* 2. Card Variants & Elevations */}
      <div style={sectionStyle}>
        <Heading level={2}>2. Card Primitives & Surface Variants</Heading>
        <Text variant="secondary">Variants: Default Surface, Glassmorphism Blur, Diagnostic Amber, Mastery Emerald</Text>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <Card variant="default">
            <Heading level={3}>Default Surface Card</Heading>
            <Text variant="secondary">Solid surface background using var(--bg-surface) for standard content areas.</Text>
          </Card>

          <Card variant="glass" glow>
            <Heading level={3} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Glassmorphism Card
            </Heading>
            <Text variant="secondary">Translucent background with backdrop-filter blur and brand aura glow.</Text>
          </Card>

          <Card variant="amber">
            <Heading level={3} style={{ color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> Diagnostic Amber Card
            </Heading>
            <Text variant="secondary">Used for Socratic deviation ribbons and misconception friction highlights.</Text>
          </Card>

          <Card variant="emerald">
            <Heading level={3} style={{ color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> Mastery Emerald Card
            </Heading>
            <Text variant="secondary">Used for conceptual breakthroughs and memory retention confirmations.</Text>
          </Card>
        </div>
      </div>

      {/* 3. Badge Primitives */}
      <div style={sectionStyle}>
        <Heading level={2}>3. Badge Primitives</Heading>
        <Text variant="secondary">Variants: Concept Nodes, Level Indicators, Action Pills, Mastery Badges</Text>
        
        <div style={rowStyle}>
          <Badge variant="concept" icon={<BookOpen size={12} />}>c_linear_algebra</Badge>
          <Badge variant="concept" icon={<BookOpen size={12} />}>c_vector_calculus</Badge>
          <Badge variant="level">Level 1: Nudge</Badge>
          <Badge variant="level">Level 2: Concept</Badge>
          <Badge variant="level">Level 3: Analogy</Badge>
          <Badge variant="level">Level 4: Deconstruct</Badge>
          <Badge variant="amber" icon={<AlertTriangle size={12} />}>10s Trap Spotted</Badge>
          <Badge variant="mastery" icon={<CheckCircle2 size={12} />}>Mastery Achieved</Badge>
          <Badge variant="action">RECOMMENDED: HINT</Badge>
        </div>
      </div>

      {/* 4. Typography Hierarchy */}
      <div style={sectionStyle}>
        <Heading level={2}>4. Typography Hierarchy & Tokens</Heading>
        <Card variant="default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Heading level={1}>Heading Level 1 — Inter 1.75rem Bold</Heading>
            <Heading level={2}>Heading Level 2 — Inter 1.35rem Bold</Heading>
            <Heading level={3}>Heading Level 3 — Inter 1.1rem SemiBold</Heading>
            <Heading level={4}>Heading Level 4 — Inter 0.95rem SemiBold</Heading>
            <Text variant="body">Body Text — Standard Inter font, optimized line height for maximum study legibility.</Text>
            <Text variant="secondary">Secondary Text — Muted slate color for supporting metadata and subtitles.</Text>
            <Text variant="muted">Muted Text — Extra quiet text for timestamps and IDs.</Text>
            <div style={{ marginTop: '8px' }}>
              <Text variant="code">F_parallel = m * g * sin(theta) // JetBrains Mono Code Block</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
