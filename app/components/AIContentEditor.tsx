import { useState } from 'react'

interface AIContentEditorProps {
  title: string;
  onContentGenerated: (content: string) => void;
}

export default function AIContentEditor({ title, onContentGenerated }: AIContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async () => {
    if (!title) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: title })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await response.json()
      onContentGenerated(data.content)
    } catch (error) {
      console.error('Failed to generate content:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="text-sm text-gray-500 mb-4">
          AI 将根据标题生成相关内容
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        <button
          onClick={generateContent}
          disabled={isLoading || !title}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <svg
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLoading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
                <path
                  d="M12 8V16M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
          {isLoading ? '内容生成中...' : 'AI 生成内容'}
        </button>
      </div>
    </div>
  )
}