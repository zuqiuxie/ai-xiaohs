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
    const { originalText, title, keywords, style, additionalInfo } = await req.json();

    // 验证必要参数
    if (!originalText || !title || !keywords) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: `作为小红书爆款写手，请创作一篇超吸引的干货笔记！

关键点：
1. 标题（12字内）：
   - 基于"${title}"改写
   - 开头/结尾加emoji
   - 制造好奇/痛点

2. 内容（200-300字）：
   - 开篇：一句话吸引注意
   - 主体：2-3个核心干货
     * 用💡标记重点
     * 【标题】+简短说明
     * 每点必须可执行
   - 结尾：一句总结+行动号召
   - 3个#标签

3. 风格：
   - 像和闺蜜聊天般轻松
   - 多用"宝藏""绝了""收藏先点赞"等爆款词
   - 重点突出，层次分明
   - 干货实用为王`,
      },
      {
        role: 'user',
        content: `参数：
标题：${title}
关键词：${keywords}
风格：${style}
${additionalInfo ? `补充：${additionalInfo}` : ''}

参考：${originalText}

要求：
1. 原创内容，不照搬
2. 突出关键词重点
3. 确保干货实用
4. 适合小红书排版`,
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
        temperature: 0.75, // 适当提高创造性
        max_tokens: 1500, // 确保内容完整
        stream: true,
        presence_penalty: 0.4, // 增加新内容的倾向
        frequency_penalty: 0.4, // 减少重复内容
        top_p: 0.9, // 保持输出的多样性
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
            if (data === '[DONE]') {
              // 确保发送最后累积的完整内容
              if (accumulatedContent) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    content: accumulatedContent,
                    done: true
                  })}\n\n`)
                );
              }
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                // 累积内容
                accumulatedContent += parsed.choices[0].delta.content;
                // 发送累积的内容
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    content: accumulatedContent,
                    done: false
                  })}\n\n`)
                );
              }
            } catch (e) {
              console.error('Parse error:', e);
              continue;
            }
          }
        }
      },
      flush(controller) {
        // 确保在流结束时发送所有剩余内容
        if (accumulatedContent) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              content: accumulatedContent,
              done: true
            })}\n\n`)
          );
        }
      }
    });

    // 调整响应配置
    const responseInit = {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    };

    // 确保响应体存在
    if (!response.body) {
      throw new Error('Response body is null');
    }

    return new Response(response.body.pipeThrough(transform), responseInit);
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后重试', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
