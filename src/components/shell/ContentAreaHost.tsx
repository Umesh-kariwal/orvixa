import React from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { OrvixaIntentRenderer } from '@/components/renderers/OrvixaIntentRenderer';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import type { IntentPayload } from '@/rendering/core/types';

export const ContentAreaHost: React.FC = () => {
  const { panelState, selectedAction, streamingText, errorMessage, activeContext } = useSidePanel();

  if (panelState === 'THINKING') {
    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card variant="glass" glow style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-primary)' }} />
          <div>
            <Heading level={4}>Orvixa Learning Engine</Heading>
            <Text variant="secondary">Analyzing subject query and structuring learning pathway...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (panelState === 'STREAMING' || (panelState === 'READY' && streamingText)) {
    const actionId = selectedAction?.action_id || 'explain';

    // Map intent modes to adaptive learning card layouts
    let intentType: IntentPayload['intent_type'] = 'SAFE_MARKDOWN';
    let structuredData: any = { markdown: streamingText };

    if (actionId === 'hint') {
      intentType = 'SOCRATIC_HINT';
      structuredData = {
        hints: [
          'Level 1: Binary Search splits the array into two search partitions on each step.',
          'Level 2: Ensure the search array is sorted. If target < array[mid], adjust right pointer.',
          'Level 3: Ensure right boundary updates to mid - 1 to avoid infinite loop limits.',
        ],
      };
    } else if (actionId === 'practice') {
      intentType = 'CHECKLIST';
      structuredData = {
        items: [
          'Solve Binary Search on sorted array [-10, -3, 0, 5, 9], target = 9',
          'Calculate mid pointer indices at each division step',
          'Identify base cases and boundary exit values',
        ],
      };
    } else if (actionId === 'teach') {
      intentType = 'TIMELINE';
      structuredData = {
        events: [
          { timestamp: 'Step 1', title: 'Initialization', description: 'Set left = 0, right = length - 1' },
          { timestamp: 'Step 2', title: 'Mid Calculation', description: 'Compute middle index using integer floor division' },
          { timestamp: 'Step 3', title: 'Partition Check', description: 'Compare mid value against target and divide search space' },
        ],
      };
    }

    const payload: IntentPayload = {
      intent_type: intentType,
      confidence: 0.98,
      summary: streamingText || 'Learning Guidance Available.',
      structured_data: structuredData,
      is_streaming: panelState === 'STREAMING',
    };

    return (
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Action Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant="mastery" icon={<Sparkles size={12} />}>
            {selectedAction?.label || 'AI Guidance'}
          </Badge>
          <Text variant="muted">Pedagogical Stream</Text>
        </div>

        {/* Universal Intent Renderer Runtime Slot */}
        <OrvixaIntentRenderer rawPayload={payload} isStreaming={panelState === 'STREAMING'} />
      </div>
    );
  }

  if (panelState === 'ERROR') {
    return (
      <div style={{ padding: '24px 16px' }}>
        <Card variant="amber">
          <Heading level={4} style={{ color: 'var(--rose-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> Engine Error
          </Heading>
          <Text variant="secondary">{errorMessage || 'Pedagogical session interrupted. Fallback active.'}</Text>
        </Card>
      </div>
    );
  }

  // Default IDLE State
  const pageTitle = activeContext?.sanitized_summary || 'Active Web Page';

  return (
    <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--amber-primary)',
        }}
      >
        <Sparkles size={24} />
      </div>

      <Heading level={3}>Universal Learning Copilot Active</Heading>
      <Text variant="secondary" style={{ textAlign: 'center', maxWidth: '300px' }}>
        Active Page: {pageTitle}. Highlight text to analyze or select a card action above for Socratic hints, practice quizzes, or codebase tutoring.
      </Text>
    </div>
  );
};
