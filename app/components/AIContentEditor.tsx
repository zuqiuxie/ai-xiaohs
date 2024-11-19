import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface AIContentEditorProps {
  title: string;
  onContentGenerated: (content: string) => void;
}

export default function AIContentEditor({ title, onContentGenerated }: AIContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  const generateContent = async () => {
    if (!title) return;

    setIsLoading(true);
    setError(null);
    let accumulatedContent = '';

    console.log('Starting content generation...');

    try {
      console.log('Sending request to API...');
      const response = await fetch('/api/generate/ai-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                '你是一个专业的内容创作者，擅长生成小红书风格的文章。请根据用户提供的主题，生成一篇结构清晰、内容丰富的文章。使用 Markdown 格式。',
            },
            {
              role: 'user',
              content: title,
            },
          ],
        }),
      });

      console.log('Response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      console.log('Reader created:', !!reader);

      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          console.log('Read chunk:', done ? 'done' : 'not done', value?.length || 0);

          if (done) {
            console.log('Stream complete');
            break;
          }

          const chunk = decoder.decode(value);
          console.log('Decoded chunk:', chunk);
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            console.log('Processing line:', line);
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(5));
                console.log('Parsed data:', data);

                if (data.content && data.content.trim()) {
                  accumulatedContent = data.content;
                  console.log('Updating content:', accumulatedContent);
                  onContentGenerated(accumulatedContent);
                }

                if (data.done) {
                  console.log('Stream completed with content:', accumulatedContent);
                  continue;
                }
              } catch (e) {
                console.error('Error parsing chunk:', e, 'Line:', line);
              }
            }
          }
        }
      } finally {
        console.log('Releasing reader');
        reader.releaseLock();
      }

      console.log('Content generation complete');
      trackEvent('generate_content', {
        status: 'success',
        title,
        contentLength: accumulatedContent.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to generate content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content');

      trackEvent('generate_content', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        title,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="text-sm text-gray-500 mb-4">AI 将根据标题生成相关内容</div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        <button
          onClick={generateContent}
          disabled={isLoading || !title}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group">
          <svg
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLoading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            {isLoading ? (
              <path
                d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12"
                stroke="currentColor"
                strokeWidth="2"
              />
            ) : (
              <>
                <path
                  d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
          {isLoading ? '内容生成中...' : 'AI 生成内容'}
        </button>
      </div>
    </div>
  );
}
