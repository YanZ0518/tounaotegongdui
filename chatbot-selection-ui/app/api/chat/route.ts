import { NextResponse } from 'next/server';

const MOONSHOT_API_KEY = 'sk-UfCpXU8uEJuMesOg0uD3D1wyfV04uuwBlWztsGma2Lnehl4t';
const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(`${MOONSHOT_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: messages,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Moonshot API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Moonshot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 