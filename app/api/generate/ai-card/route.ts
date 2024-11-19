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
        content: `你是一位深谙小红书爆款笔记创作的资深博主。请根据用户输入的主题，生成一篇吸引人的小红书笔记（包含标题和正文）。

标题要求：
- 基于用户输入的主题，生成更吸引眼球的标题
- 标题字数控制在20字符以内(包含emoji)
- 标题需包含1-2个emoji，放在标题开头或结尾
- 标题要有爆点，制造好奇心
- 可以用"？""！"等标点增强表现力

正文创作要求：
- 开头要吸引眼球，用简短有力的文案hook住读者
- 必须分3个要点展开，每个要点需要：
  * 用"🔍|💡|✨|📌|💫"等emoji突出重点
  * 要点标题加粗突出
  * 内容详实但简洁，避免废话
- 文风要求：
  * 亲和力强的对话式表达，像在跟好朋友分享
  * 口语化表达，自然不做作
  * 适度使用"绝绝子""yyds""无语子"等小红书流行用语
  * 传递真诚和专业感
- 结尾加上3个相关话题标签，用#号开头

整体要求：
- 正文字数控制在300字以内
- 内容要有价值和可操作性
- 避免过度营销感和虚假信息
- 适量使用标点符号增强表达力（❗️、❓、～）
- 注意性别中立的表达方式，内容要适合所有用户群体`,
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
      async transform(chunk, controller) {
        try {
          console.log('[Edge] Processing chunk:', new Date().toISOString(), 'Size:', chunk.length);
          const text = new TextDecoder().decode(chunk);
          console.log('Raw chunk:', text);

          const lines = text.split('\n');
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(5).trim();
              if (data === '[DONE]') {
                controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(`data: ${JSON.stringify({
                    content,
                    done: false,
                    isPartial: true  // 添加标记表示这是部分内容
                  })}\n\n`);
                }
              } catch (e) {
                console.error('Parse error:', e, 'Line:', line);
              }
            }
          }
          console.log('[Edge] Chunk processed:', new Date().toISOString());
        } catch (error) {
          console.error('[Edge] Transform error:', error, new Date().toISOString());
          controller.error(error);
        }
      }
    });

    const stream = response.body
      ?.pipeThrough(transformStream)
      ?.pipeThrough(new TextEncoderStream());

    if (!stream) {
      throw new Error('Failed to create stream');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
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
      type: error instanceof Error ? error.name : 'Unknown type'
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
