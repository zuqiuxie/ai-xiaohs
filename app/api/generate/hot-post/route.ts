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

关键点：
1. 标题（16字内）：
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

    let buffer = '' // 添加buffer处理不完整的数据

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let accumulatedContent = ''
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            buffer += chunk // 将新chunk添加到buffer

            // 处理完整的行
            const lines = buffer.split('\n')
            // 保留最后一个可能不完整的行
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(5).trim()

                // 调试日志
                console.log('Processing line:', data)

                if (data === '[DONE]') {
                  controller.enqueue(
                    `data: ${JSON.stringify({ content: accumulatedContent, done: true })}\n\n`
                  )
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.choices?.[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content
                    // 确保发送格式一致的数据
                    const chunk = `data: ${JSON.stringify({
                      content: accumulatedContent,
                      done: false
                    })}\n\n`
                    controller.enqueue(chunk)
                  }
                } catch (e) {
                  console.error('Parse error:', e, 'Data:', data)
                  continue
                }
              }
            }
          }

          // 处理最后可能剩余的buffer
          if (buffer.length > 0) {
            try {
              const data = buffer.trim()
              if (data.startsWith('data: ')) {
                const parsed = JSON.parse(data.slice(5))
                if (parsed.choices?.[0]?.delta?.content) {
                  accumulatedContent += parsed.choices[0].delta.content
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      content: accumulatedContent,
                      done: false
                    })}\n\n`
                  )
                }
              }
            } catch (e) {
              console.error('Final buffer parse error:', e)
            }
          }

          // 确保发送最终内容
          controller.enqueue(
            `data: ${JSON.stringify({ content: accumulatedContent, done: true })}\n\n`
          )
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          reader.releaseLock()
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Edge-Function': 'true'
      }
    })

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
