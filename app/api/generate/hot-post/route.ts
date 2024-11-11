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
    const { originalText, keywords, style, additionalInfo } = await req.json();

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
        content: `你是一位专业的小红书爆款笔记创作者。你的任务是创作一篇全新的原创笔记。

创作要求：
1. 内容定位：
   - 完全原创：基于用户关键词创作全新内容，严禁复制或模仿参考笔记的具体内容
   - 写作风格：仅参考原文的表达方式和结构特点，如分点方式、语气语调等
   - 内容规划：围绕用户提供的关键词，结合用户期望的内容风格展开创作

2. 内容结构（600字以内）：
   - 标题：基于关键词创作吸引力标题，用1-2个恰当的emoji装饰
   - 开场：1-2句简短吸引力开场，设置情境或抛出观点
   - 主体：2-3个核心论点，用数字编号，每个论点都要论据充分
   - 结尾：1句点题或总结，呼应主题，不要硬拉互动

3. 写作风格：
   - 语言基调：严格按照用户选择的内容风格来定调（专业、轻松、故事等）
   - emoji运用：根据内容风格调整，专业文章克制使用，生活类适度活泼
   - 结构布局：保持层次清晰，重点突出
   - 表达方式：可以是专业的、故事化的、对话式的等，以用户选择的风格为准

4. 质量要求：
   - 观点完整性：论点+论据+案例/数据
   - 逻辑性：确保文章脉络清晰，观点递进
   - 原创性：必须是全新的想法和内容
   - 精炼性：语言简洁有力，避免废话
   - 价值性：内容要有深度，能引发共鸣
   - 互动性：自然流畅，避免强制营销感`,
      },
      {
        role: 'user',
        content: `创作参数：

核心关键词：${keywords}
内容风格：${style}
${additionalInfo ? `补充信息：${additionalInfo}` : ''}

参考笔记：${originalText}

创作要求：
1. 必须原创：基于关键词创作全新内容，禁止照搬参考笔记
2. 风格借鉴：仅参考原文的写作风格（如表达方式、结构特点等）
3. 内容规划：紧扣关键词，按用户选择的风格展开
4. 质量把控：
   - 确保每个观点都完整展开
   - 控制好整体节奏和字数
   - 适合小红书图文布局
   - 保持内容的原创性和价值性`,
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
