'use client';

import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { showToast } from '@/app/utils/toast';

interface HotPostEditorProps {
  onContentGenerated: (content: string) => void;
}

const HotPostEditor = ({ onContentGenerated }: HotPostEditorProps) => {
  const [originalText, setOriginalText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentStyle, setContentStyle] = useState('轻松活泼');

  const { trackEvent } = useAnalytics();

  const handleGenerate = async () => {
    if (!originalText || !keywords) {
      showToast('请填写原文和关键词', 'error');
      return;
    }

    if (originalText.length < 50) {
      showToast('原文内容太短，建议提供更详细的参考内容', 'error');
      return;
    }

    if (keywords.split(',').length > 3) {
      showToast('关键词不要超过3个，以确保内容聚焦', 'error');
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

      // trackEvent('generate_hot_post', {
      //   timestamp: new Date().toISOString(),
      // });

    } catch (error) {
      console.error('生成失败:', error);
      showToast(error instanceof Error ? error.message : '生成失败，请重试', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-2">原文参考</label>
        <div className="space-y-2">
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder="粘贴你想参考的爆款笔记内容..."
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
          />
          <div className="text-xs text-gray-500">
            提示：建议选择与你主题相关、互动数据好的爆款笔记作为参考
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">核心关键词</label>
        <div className="space-y-2">
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="输入2-3个核心关键词，用逗号分隔"
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="text-xs text-gray-500">
            示例：减肥食谱, 低卡, 健康 | 遛娃攻略, 亲子互动, 教育
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">内容风格</label>
        <div className="grid grid-cols-3 gap-2">
          {['轻松活泼', '专业严谨', '感性温暖'].map(style => (
            <button
              key={style}
              onClick={() => setContentStyle(style)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                contentStyle === style
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              } border`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">补充信息（选填）</label>
        <div className="space-y-2">
          <textarea
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
            placeholder="添加一些独特的观点、个人经验或数据..."
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-none"
          />
          <div className="text-xs text-gray-500">
            提示：添加具体的案例、数据或个人经验可以提高内容的可信度和价值
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            开始生成
          </>
        )}
      </button>
    </div>
  );
};

export default HotPostEditor;