export const runtime = 'edge';

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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建增强的消息数组
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
      throw new Error(`Deepseek API error: ${response.status}`);
    }

    // 使用 ReadableStream 和 TransformStream 处理流式响应
    let buffer = ''; // 添加buffer处理不完整的数据

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let accumulatedContent = '';
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            buffer += chunk; // 将新chunk添加到buffer

            // 处理完整的行
            const lines = buffer.split('\n');
            // 保留最后一个可能不完整的行
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5).trim();

                // 调试日志
                console.log('Processing line:', data);

                if (data === '[DONE]') {
                  controller.enqueue(`data: ${JSON.stringify({ content: accumulatedContent, done: true })}\n\n`);
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content;
                    // 确保发送格式一致的数据
                    const chunk = `data: ${JSON.stringify({
                      content: accumulatedContent,
                      done: false,
                    })}\n\n`;
                    controller.enqueue(chunk);
                  }
                } catch (e) {
                  console.error('Parse error:', e, 'Data:', data);
                  continue;
                }
              }
            }
          }

          // 处理最后可能剩余的buffer
          if (buffer.length > 0) {
            try {
              const data = buffer.trim();
              if (data.startsWith('data: ')) {
                const parsed = JSON.parse(data.slice(5));
                if (parsed.choices?.[0]?.delta?.content) {
                  accumulatedContent += parsed.choices[0].delta.content;
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      content: accumulatedContent,
                      done: false,
                    })}\n\n`
                  );
                }
              }
            } catch (e) {
              console.error('Final buffer parse error:', e);
            }
          }

          // 确保发送最终内容
          controller.enqueue(`data: ${JSON.stringify({ content: accumulatedContent, done: true })}\n\n`);
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Edge-Function': 'true',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({
        error: '生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
