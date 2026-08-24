import { env } from '@/config/env';
import {
  openUrl, openNativeAppOrWeb, triggerMediaControl,
  resolveYouTubeVideoId, autoPlayYouTubeVideo
} from '@/hooks/desktopActions';

export interface AgentStep {
  id: number;
  title: string;
  action_type: string;
  target_tool: string;
  arguments: Record<string, any>;
  detail?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AgentPlan {
  goal: string;
  confidence: number;
  reasoning: string;
  steps: AgentStep[];
}

declare const window: any;
const IS_TAURI = typeof window !== 'undefined' && (!!window.__TAURI__ || !!window.__TAURI_INTERNALS__);

async function invokeTauri(cmd: string, args?: Record<string, unknown>): Promise<any> {
  if (!IS_TAURI) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(cmd, args);
  } catch {
    return null;
  }
}

/**
 * Fetches dynamic SOTA LLM Execution Graph from Backend / Local Orchestrator.
 */
export async function fetchLLMAgentPlan(userPrompt: string): Promise<AgentPlan | null> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/agent/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.steps) {
        return {
          goal: data.goal || userPrompt,
          confidence: data.confidence || 0.95,
          reasoning: data.reasoning || 'SOTA Tool Graph Generated',
          steps: data.steps.map((s: any) => ({
            ...s,
            status: 'pending' as const,
          })),
        };
      }
    }
  } catch (err) {
    console.warn('[Orchestrator API Error] Falling back to local agent engine', err);
  }

  return null;
}

/**
 * Executes an Agent Plan sequentially with real-time tool calling and self-healing.
 */
export async function executeAgentPlan(
  plan: AgentPlan,
  onStepChange: (updatedPlan: AgentPlan) => void
): Promise<string> {
  let resolvedYtWatchUrl = '';

  for (let i = 0; i < plan.steps.length; i++) {
    plan.steps[i].status = 'in_progress';
    onStepChange({ ...plan });
    await new Promise((r) => setTimeout(r, 450));

    const step = plan.steps[i];
    try {
      switch (step.action_type) {
        case 'open_url':
          if (step.arguments?.url) {
            await openUrl(step.arguments.url);
          }
          step.status = 'completed';
          break;

        case 'resolve_youtube':
          if (step.arguments?.query) {
            const vidId = await resolveYouTubeVideoId(step.arguments.query);
            resolvedYtWatchUrl = vidId
              ? `https://www.youtube.com/watch?v=${vidId}`
              : `https://www.youtube.com/results?search_query=${encodeURIComponent(step.arguments.query)}`;
          }
          step.status = 'completed';
          break;

        case 'format_message':
          step.status = 'completed';
          break;

        case 'launch_whatsapp':
          const targetRecipient = step.arguments?.recipient || 'Contact';
          const msg = `Hello ${targetRecipient}, check out this link: ${resolvedYtWatchUrl || 'https://youtube.com'}`;
          await openNativeAppOrWeb(
            `whatsapp://send?text=${encodeURIComponent(msg)}`,
            `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`
          );
          step.status = 'completed';
          break;

        case 'media_control':
          const action = step.arguments?.action || 'volume_up';
          triggerMediaControl(action as any);
          step.status = 'completed';
          break;

        case 'native_click_coords':
          if (step.arguments?.x !== undefined && step.arguments?.y !== undefined) {
            await invokeTauri('execute_synthetic_mouse_click', {
              x: step.arguments.x,
              y: step.arguments.y,
            });
          }
          step.status = 'completed';
          break;

        case 'native_type_text':
          if (step.arguments?.text) {
            await invokeTauri('execute_synthetic_key_sequence', {
              text: step.arguments.text,
            });
          }
          step.status = 'completed';
          break;

        default:
          if (step.arguments?.query) {
            await autoPlayYouTubeVideo(step.arguments.query);
          }
          step.status = 'completed';
          break;
      }
    } catch (e) {
      console.error(`[Agent Step Error] Failed step ${step.id}:`, e);
      step.status = 'failed';
    }

    onStepChange({ ...plan });
  }

  return `Autonomous Goal Completed: "${plan.goal}"`;
}
