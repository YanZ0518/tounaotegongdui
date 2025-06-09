import { API_CONFIG, getApiHeaders } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
}

export async function createChatCompletion(request: ChatCompletionRequest, retries = 3) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.MODEL_PATH}`;
  const headers = getApiHeaders();
  const body = JSON.stringify({
    ...request,
    model: API_CONFIG.MODEL_NAME,
    stream: false,
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { method: 'POST', headers, body });
      const text = await response.text();
      if (!response.ok) {
        console.error('Silu API Error:', text);
        throw new Error(`Silu API Error: ${response.status} ${response.statusText}\n${text}`);
      }
      const data = JSON.parse(text);
      if (!data.choices || !data.choices[0]?.message) {
        throw new Error('Silu API 响应格式无效: ' + text);
      }
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }
} 