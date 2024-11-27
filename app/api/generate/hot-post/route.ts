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
        content: `你是一位擅长简洁表达的小红书创作者。请创作一篇精炼的分享，总字数严格控制在250字以内。注意：直接输出内容，不要包含任何标记性文字（如"标题："、"正文："等）。

创作规范：
1. 首行：
   - 20字内的标题
   - 自然融入1-2个emoji
   - 运用以下吸引力要素：
     * 设置悬念："我发现..."
     * 突出价值："这样做..."
     * 分享感悟："原来..."

2. 正文（换行书写）：
   - 第一段（50字内）：个人经历或发现
   - 中间2-3段（150字内）：
     * 每段以温和emoji(🔍💡✨📌💫🌟💎🎯⭐️🔆)开头
     * 每段一个核心观点和具体建议
   - 最后一段（30字内）：简短总结或互动

写作要求：
- 像朋友间对话般自然
- 用简单词句表达专业内容
- 通过细节增加真实感
- 保持内容精炼但不失温度
- 严格控制总字数在250字内
- 绝对不输出任何标记性文字`,
      },
      {
        role: 'user',
        content: `创作素材：
主题：${title}
关键词：${keywords}
风格：${style}
${additionalInfo ? `补充：${additionalInfo}` : ''}

参考：${originalText}

要求：
1. 直接输出内容，不要任何标记文字
2. 突出核心关键词
3. 内容精炼有价值
4. 适合快速阅读
5. 总字数限200字内`,
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
