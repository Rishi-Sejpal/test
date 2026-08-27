import { ChatRequest, ChatResponse, ScorecardResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const base = API_BASE || '';
  const response = await fetch(`${base}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const base = API_BASE || '';
  const response = await fetch(`${base}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
