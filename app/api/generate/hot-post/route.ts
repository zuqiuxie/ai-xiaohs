export const runtime = 'edge'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(req: Request) {
  if (!DEEPSEEK_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'API key is not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const { originalText, title, keywords, style, additionalInfo } = await req.json()

    if (!originalText || !title || !keywords) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 保持原有的消息结构
    const messages = [
      {
        role: 'system',
        content: `作为小红书爆款写手，请创作一篇超吸引的干货笔记！

创作格式：
1. 标题要求：
   - 基于用户输入的主题，生成更吸引眼球的标题
   - 标题字数控制在20字符以内(包含emoji)
   - 标题需包含1-2个emoji，放在标题开头或结尾
   - 标题要有爆点，制造好奇心
   - 可以用"？""！"等标点增强表现力

2. 内容结构：
   - 开篇：一句话吸引注意
   - 主体：2-3个核心要点
     * 用💡|✨|📌等emoji突出每个要点
     * 直接写要点标题，不用标序号
     * 每点必须可执行
   - 结尾：一句总结+行动号召
   - 3个#标签

3. 写作风格：
   - 对话式表达，像朋友间分享
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
4. 适合小红书排版
5. 不要输出"标题："和"正文："等标记文字`,
      },
    ]

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.75,
        max_tokens: 3000,
        stream: true,
        presence_penalty: 0.4,
        frequency_penalty: 0.4,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.status}`)
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
                controller.enqueue(`data: ${JSON.stringify({
                  content,
                  done: false,
                  isPartial: true
                })}\n\n`);
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
    console.error('Generation error:', error)
    return new Response(
      JSON.stringify({
        error: '生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
