export const runtime = 'edge';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key is not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 从用户消息中提取主题（如果有的话）
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    // 构建增强的消息数组
    const enhancedMessages = [
      {
        role: "system",
        content: `你是一位专业的小红书文案创作者，擅长创作吸引人的内容。请按照以下格式创作：

1. 标题：简短吸引人，包含数字或emoji
2. 开场：制造共鸣或好奇
3. 正文：分点描述，重点突出，细节具体
4. 结尾：互动引导
5. 标签：3-5个相关话题标签

注意事项：
- 语气要自然亲切，像朋友间分享
- 适当加入emoji表情
- 使用口语化表达
- 可以使用小红书平台常用词汇
- 突出个人体验和真实感受
- 保持内容真实可信，避免过度营销感`
      },
      ...messages
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: enhancedMessages,
        temperature: 0.8,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
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
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content;
                    // 发送累积的内容（替换而不是追加）
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: accumulatedContent })}\n\n`));
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e);
                }
              }
            }
          }
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
        'Connection': 'keep-alive',
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