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
    const startTime = Date.now();
    console.log('[Client] Generation started:', new Date().toISOString());

    if (!title) return;

    setIsLoading(true);
    setError(null);
    let accumulatedContent = '';

    console.log('Starting content generation...');

    try {
      const response = await fetch('/api/generate/ai-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: title,
            },
          ],
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();

      // 监控流式响应
      let chunkCount = 0;
      let lastChunkTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const totalTime = Date.now() - startTime;
          console.log('[Client] Stream complete:', {
            totalTime: `${totalTime}ms`,
            chunkCount,
            timestamp: new Date().toISOString()
          });
          break;
        }

        chunkCount++;
        const currentTime = Date.now();
        const timeSinceLastChunk = currentTime - lastChunkTime;

        // 监控块之间的延迟
        if (timeSinceLastChunk > 5000) { // 5秒阈值
          console.warn('[Client] Long delay between chunks:', {
            delay: `${timeSinceLastChunk}ms`,
            chunkNumber: chunkCount,
            timestamp: new Date().toISOString()
          });
        }

        lastChunkTime = currentTime;
        console.log('[Client] Chunk received:', {
          chunkNumber: chunkCount,
          chunkSize: value.length,
          timeSinceStart: `${currentTime - startTime}ms`,
          timestamp: new Date().toISOString()
        });

        const chunk = decoder.decode(value);
        console.log('Raw chunk received:', chunk);

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              console.log('Parsed data:', data);

              if (data.content && typeof data.content === 'string') {
                accumulatedContent += data.content;
                console.log('Accumulated content:', accumulatedContent);
                onContentGenerated(accumulatedContent);
              }

              if (data.done) {
                console.log('Stream marked as done');
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Line:', line);
            }
          }
        }
      }

      if (!accumulatedContent.trim()) {
        throw new Error('No content was generated');
      }

      trackEvent('generate_content', {
        status: 'success',
        title,
        contentLength: accumulatedContent.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Client] Generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeSinceStart: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
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
