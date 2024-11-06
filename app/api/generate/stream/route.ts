const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  if (!DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
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
        Accept: 'text/event-stream',
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 创建一个 TransformStream 来处理数据
    let accumulatedContent = ''; // 用于累积内容
    const transform = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                // 累积内容
                accumulatedContent += parsed.choices[0].delta.content;
                // 发送累积的内容（替换而不是追加）
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content: accumulatedContent })}\n\n`)
                );
              }
            } catch (e) {
              console.error('Parse error:', e);
              continue;
            }
          }
        }
      },
    });

    return new Response(response.body?.pipeThrough(transform), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后重试', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
