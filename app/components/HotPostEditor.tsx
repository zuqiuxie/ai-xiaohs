'use client';

import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface HotPostEditorProps {
  onContentGenerated: (content: string) => void;
}

const HotPostEditor = ({ onContentGenerated }: HotPostEditorProps) => {
  const [originalText, setOriginalText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { trackEvent } = useAnalytics();

  const handleGenerate = async () => {
    if (!originalText || !keywords) {
      alert('请输入原文和关键词');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate/hot-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          keywords,
          additionalInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (!reader) {
        throw new Error('No reader available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(5));
                if (data.content && data.content.trim()) {
                  content = data.content;
                  onContentGenerated(content);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      trackEvent('generate_hot_post', {
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-2">原文参考</label>
        <textarea
          value={originalText}
          onChange={e => setOriginalText(e.target.value)}
          placeholder="请输入要参考的爆款文案原文"
          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">笔记关键词</label>
        <input
          type="text"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="例如：产品名，产品类型等"
          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">笔记相关信息（可选）</label>
        <textarea
          value={additionalInfo}
          onChange={e => setAdditionalInfo(e.target.value)}
          placeholder="希望强调的产品优势、产品亮点等"
          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            生成中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            一键生成
          </>
        )}
      </button>
    </div>
  );
};

export default HotPostEditor;