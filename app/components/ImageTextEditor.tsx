import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageTextEditorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export default function ImageTextEditor({ onImageGenerated }: ImageTextEditorProps) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = useTranslations('editor');

  const handleGenerateImage = async () => {
    if (!keyword.trim()) {
      setError(t('textImageTip'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate/image-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      onImageGenerated(data.url);
    } catch (err) {
      setError('生成图片失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder={t('textImageTip')}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <button
        onClick={handleGenerateImage}
        disabled={isLoading}
        className={`w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                     hover:from-blue-600 hover:to-purple-600 text-white rounded-xl
                     transition-all duration-200 flex items-center justify-center
                     gap-2 shadow-sm hover:shadow-md disabled:opacity-50
                     disabled:cursor-not-allowed font-medium`}>
        {isLoading ? t('textImageBtn2') : t('textImageBtn')}
      </button>
    </div>
  );
}
