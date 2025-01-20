'use client';

import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { showToast, ToastType } from '@/app/utils/toast';
import { useTranslations } from 'next-intl';


interface HotPostEditorProps {
  onContentGenerated: (content: string) => void;
}

const HotPostEditor = ({ onContentGenerated }: HotPostEditorProps) => {
  const [originalText, setOriginalText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentStyle, setContentStyle] = useState('轻松活泼');

  const t = useTranslations('editor');

  const styleList = [
    t('hotContentStyleList1'),
    t('hotContentStyleList2'),
    t('hotContentStyleList3')
  ];

  const handleGenerate = async () => {
    const titleInput = document.getElementById('topicInput') as HTMLInputElement;
    const title = titleInput?.value || '';

    if (!title) {
      showToast(t('hotPostTip1'), 'warning');
      return;
    }

    if (!originalText.trim()) {
      showToast(t('hotPostTip2'), 'warning');
      return;
    }

    if (originalText.length < 50) {
      showToast(t('hotPostTip3'), 'warning');
      return;
    }

    if (!keywords) {
      showToast(t('hotPostTip4'), 'warning');
      return;
    }

    if (keywords && keywords.split(',').length > 3) {
      showToast(t('hotPostTip5'), 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const titleInput = document.querySelector('input[type="text"][placeholder="输入标题"]') as HTMLInputElement;
      const title = titleInput?.value || '';

      const response = await fetch('/api/generate/hot-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          originalText,
          keywords,
          style: contentStyle,
          additionalInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'generate failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

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
                if (data.done) {
                  console.log('Stream complete');
                  break;
                }
                if (data.content && typeof data.content === 'string') {
                  if (data.isPartial) {
                    accumulatedContent += data.content;
                    onContentGenerated(accumulatedContent);
                  } else {
                    accumulatedContent = data.content;
                    onContentGenerated(accumulatedContent);
                  }
                }
              } catch (e) {
                console.error('Error parsing chunk:', e, 'Line:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'generate failed, please try again', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-2 gap-6 mb-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">{t('hotOriginTitle')}</label>
            <span className={`text-xs ${originalText.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
              {originalText.length} / 2000
            </span>
          </div>
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder={t('hotOriginTitleTip')}
            className="w-full h-[calc(100%-32px)] px-4 py-3 bg-white/80 rounded-xl
                     border border-gray-200/80 focus:outline-none focus:ring-2
                     focus:ring-blue-500/20 transition-all resize-none
                     placeholder:text-gray-400 text-gray-600"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('hotKeywords')}</label>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {t('hotKeywordsTip2')}
              </span>
            </div>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder={t('hotKeywordsTip')}
              className="w-full px-4 py-2.5 bg-white/80 rounded-xl border
                       border-gray-200/80 focus:outline-none focus:ring-2
                       focus:ring-blue-500/20 transition-all text-sm
                       placeholder:text-gray-400 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('hotContentStyle')}</label>
            <div className="grid grid-cols-3 gap-2">
              {styleList.map(style => (
                <button
                  key={style}
                  onClick={() => setContentStyle(style)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${
                              contentStyle === style
                                ? 'bg-blue-50/80 text-blue-600 ring-1 ring-blue-200'
                                : 'bg-white/80 text-gray-600 hover:bg-gray-50 border border-gray-200/80'
                            }`}>
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('hotAddInfo')}</label>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {t('hotAddInfoTip2')}
              </span>
            </div>
            <textarea
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              placeholder={t('hotAddInfoTip')}
              className="w-full h-[120px] px-4 py-3 bg-white/80 rounded-xl
                       border border-gray-200/80 focus:outline-none focus:ring-2
                       focus:ring-blue-500/20 transition-all resize-none
                       placeholder:text-gray-400 text-gray-600"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                   hover:from-blue-600 hover:to-purple-600 text-white rounded-xl
                   transition-all duration-200 flex items-center justify-center gap-2
                   disabled:cursor-not-allowed disabled:opacity-50 font-medium text-sm
                   shadow-[0_1px_2px_rgba(79,70,229,0.15)]
                   hover:shadow-[0_2px_4px_rgba(79,70,229,0.2)]
                   min-w-[200px]">
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
              <span>{t('generatingTip')}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{t('hotGenerateBtn')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HotPostEditor;
