export const runtime = 'edge';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (!DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key is not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const enhancedMessages = [
      {
        role: 'system',
        content: `你是一位在小红书深耕多年的内容创作者，擅长写作吸引人的生活分享笔记。请根据用户输入的主题，创作一篇真诚自然的小红书笔记。

创作格式：
1. 标题要求：
   - 基于用户主题，创作富有吸引力的标题
   - 标题控制在20字符以内(包含emoji)
   - 自然融入1-2个emoji，可放在开头或结尾
   - 运用悬念感、意外感或价值感来吸引点击
   - 可使用"我才知道""原来""没想到""学会这个""分享一个"等自然表达
   - 避免标题过于夸张或营销感太强

2. 内容结构：
   - 开篇要用个人经历或有趣发现快速建立共鸣
   - 分3个核心点展开，每个重点格式：
     *emoji(🔍💡✨📌💫🌟💎🎯⭐️🔆) + 简短的重点描述
     * 示例：
       "✨ 选对时间很重要"
       "💡 这样做更有效"
     * 每个重点要有具体的操作建议
   - 写作风格：
     * 像跟朋友聊天般自然流畅
     * 用生活化的语言描述
     * 适度分享个人体会和小建议
     * 保持真诚但专业的语气

整体要求：
- 内容控制在200字以内
- 注重实用性和可操作性
- 避免过度营销或虚假夸大
- 使用大众化的表达方式
- 保持内容的自然连贯性
- 不要使用明显的标记文字或序号`,
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
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepseek API error:', response.status, errorText);
      throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
    }

    const transformStream = new TransformStream({
      start(controller) {
        (this as any).buffer = '';
        (this as any).processLine = (line: string) => {
          if (line.trim() === '') return;
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') {
              controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    content,
                    done: false,
                    isPartial: true,
                  })}\n\n`
                );
              }
            } catch (e) {
              console.error('Parse error:', e, 'Line:', line);
            }
          }
        };
      },

      transform(chunk, controller) {
        try {
          // console.log('[Edge] Processing chunk:', new Date().toISOString(), 'Size:', chunk.length);
          const text = new TextDecoder().decode(chunk);
          // console.log('Raw chunk:', text);

          (this as any).buffer += text;

          const lines = (this as any).buffer.split('\n');

          (this as any).buffer = lines.pop() || '';

          for (const line of lines) {
            (this as any).processLine(line);
          }
        } catch (error) {
          console.error('[Edge] Transform error:', error, new Date().toISOString());
        }
      },

      flush(controller) {
        if ((this as any).buffer) {
          (this as any).processLine((this as any).buffer);
        }
      },
    });

    const stream = response.body?.pipeThrough(transformStream)?.pipeThrough(new TextEncoderStream());

    if (!stream) {
      throw new Error('Failed to create stream');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[Edge] Generation error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown type',
    });
    return new Response(
      JSON.stringify({
        error: '生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
