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
      <div>
        <label className="block text-xs text-gray-500 mb-2">AI 生成内容</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入想要生成的主题..."
          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
        />
      </div>
      <button
        onClick={generateContent}
        disabled={isLoading || !prompt}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm"
      >
        {isLoading ? '生成中...' : 'AI 生成'}
      </button>
    </div>
  )
}