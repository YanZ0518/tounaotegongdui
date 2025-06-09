import { NextResponse } from 'next/server';
import { createChatCompletion, ChatCompletionRequest, ChatMessage } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('收到请求体:', JSON.stringify(body, null, 2));

    const { messages, temperature = 0.7, max_tokens = 2000 } = body as ChatCompletionRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('消息格式无效:', messages);
      return NextResponse.json(
        { error: '消息格式无效' },
        { status: 400 }
      );
    }

    // 添加系统提示以保持角色特征
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are ${messages[0].content.includes('Joy') ? 'Joy' : 
                messages[0].content.includes('Anger') ? 'Anger' : 
                'Sadness'}. Maintain your character's personality and respond accordingly.`
    };

    const messagesWithSystem = [systemMessage, ...messages];

    console.log('发送到API的请求:', {
      messageCount: messagesWithSystem.length,
      temperature,
      max_tokens,
      systemMessage: systemMessage.content
    });

    const response = await createChatCompletion({
      messages: messagesWithSystem,
      temperature,
      max_tokens,
    });

    console.log('收到API响应:', JSON.stringify(response, null, 2));

    if (!response.choices || !response.choices[0]?.message) {
      throw new Error('API响应格式无效');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('聊天路由错误:', error);
    
    const errorMessage = error instanceof Error ? error.message : '发生未知错误';
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    return NextResponse.json(
      { error: errorDetails },
      { status: 500 }
    );
  }
} 