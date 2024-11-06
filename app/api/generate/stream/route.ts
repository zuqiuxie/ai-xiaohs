export const runtime = 'edge';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('API Key configured:', !!DEEPSEEK_API_KEY);

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 从用户消息中提取主题（如果有的话）
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    // 构建增强的消息数组
    const enhancedMessages = [
      {
        role: 'system',
        content: `你是一位专业的内容创作者。请根据用户的输入生成简洁的内容分享。

注意事项：
- 直接切入主题，不需要开场白
- 分2-3个要点来说明，每个要点简短精炼
- 语气自然友好，像朋友间交谈
- 适当使用emoji表情，但不要过多
- 使用简单的日常用语
- 突出关键信息和实用建议
- 内容要真实可信，避免过度营销感
- 不需要加结尾互动和标签

整体字数控制在220字以内。`,
      },
      ...messages,
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: enhancedMessages,
        temperature: 0.8,
        max_tokens: 1000,
        stream: true,
      }),
    });

    // Add response status and headers logging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', {
        status: response.status,
        errorData,
        url: DEEPSEEK_API_URL,
      });
      throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedContent = ''; // 用于累积内容

        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No reader available');
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 解码数据
            const chunk = new TextDecoder().decode(value);
            console.log('Raw chunk:', chunk);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5).trim();

                // 先检查是否是 [DONE] 标记
                if (data === '[DONE]') {
                  console.log('Stream completed with [DONE] signal');
                  continue;
                }

                try {
                  console.log('Received data chunk:', data);
                  const parsed = JSON.parse(data);
                  console.log('Parsed data:', parsed);

                  if (parsed.choices[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content;
                    console.log('Accumulated content:', accumulatedContent);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: accumulatedContent })}\n\n`));
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e, 'Raw data:', data);
                  // 不要中断流，继续处理下一条数据
                  continue;
                }
              }
            }
          }
          // 将 controller.close() 移到 while 循环外部
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
      cancel() {
        console.log('Stream was canceled');
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: '服务器错误，请稍后重试',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
