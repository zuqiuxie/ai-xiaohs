import OpenAI from 'openai';
import { OpenAIStream as BaseOpenAIStream } from 'ai';

// 确保环境变量设置正确
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function OpenAIStream(params: OpenAI.Chat.ChatCompletionCreateParams) {
  const response = await openai.chat.completions.create({
    ...params,
    stream: true,
  });

  return BaseOpenAIStream(response);
}