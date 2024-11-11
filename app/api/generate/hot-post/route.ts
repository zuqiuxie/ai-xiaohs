const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  if (!DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { originalText, keywords, additionalInfo } = await req.json();

    // 验证必要参数
    if (!originalText || !keywords) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: `你是一位专业的内容创作者。请根据用户提供的参考文案，生成一篇相似风格的内容。

注意事项：
1. 输出格式必须严格按照以下规范：
   - 第一行必须以 "# " 开头作为标题（注意 # 后有一个空格）
   - 标题后空一行
   - 然后是正文内容
2. 内容要求：
   - 保持原文的写作风格和结构
   - 突出使用提供的关键词
   - 分2-3个要点来说明，每个要点简短精炼
   - 适当使用emoji表情，但不要过多
   - 使用简单的日常用语
   - 内容要真实可信，避免过度营销感
   - 不需要加结尾互动和标签

整体字数控制在300字以内。`,
      },
      {
        role: 'user',
        content: `请参考以下信息生成内容：

参考文案：${originalText}
需要突出的关键词：${keywords}
${additionalInfo ? `补充信息：${additionalInfo}` : ''}`,
      },
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
        messages: messages,
        temperature: 0.8,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 创建一个 TransformStream 来处理数据
    let accumulatedContent = '';
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

                // 发送完整的累积内容（替换而不是追加）
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
