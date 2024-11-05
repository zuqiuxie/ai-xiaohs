import { useState } from 'react'

interface AIContentEditorProps {
  onContentGenerated: (content: string) => void;
}

export default function AIContentEditor({ onContentGenerated }: AIContentEditorProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateContent = async () => {
    if (!prompt) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      onContentGenerated(data.content)
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入想要生成的主题..."
          className="w-full px-3 py-2 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[200px] resize-none"
        />
        <button
          onClick={generateContent}
          disabled={isLoading || !prompt}
          className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            <path
              d="M15 9L9 15M9 9L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {isLoading ? '内容生成中...' : 'AI 生成内容'}
        </button>
      </div>
    </div>
  )
}