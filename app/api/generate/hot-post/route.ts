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
        content: `你是一位专业的内容创作者，擅长小红书爆款笔记创作。请根据用户提供的参考内容，生成一篇全新的笔记。

要求：
1. 输出格式：
   - 第一行：吸引人的标题（以"# "开头）
   - 空一行
   - 正文：2-3个核心观点，每个观点用数字编号

2. 写作原则：
   - 保持原文的写作风格，但避免直接复制
   - 突出用户提供的关键词
   - 加入个人观点和经验分享
   - 使用简单易懂的语言
   - 适量使用emoji增加趣味性
   - 每个观点都要有实用价值
   - 结尾要有启发性，但不加互动引导

3. 差异化处理：
   - 对原文观点进行延伸和补充
   - 增加新的视角和洞察
   - 结合当下热点或趋势
   - 添加具体的案例或数据支持

字数控制在300字以内，确保内容既专业又接地气。`,
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
