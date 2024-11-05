import ReactMarkdown from 'react-markdown'

interface MarkdownCardProps {
  content: string;
  font: string;
  fontSize: string;
  backgroundColor: string;
}

export default function MarkdownCard({ content, font, fontSize, backgroundColor }: MarkdownCardProps) {
  return (
    <div
      data-card
      className="w-[360px] h-[480px] overflow-y-auto rounded-xl shadow-lg"
      style={{
        backgroundColor,
      }}>
      <div className="p-6 h-full">
        <div
          className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm flex-1"
          style={{
            fontFamily: font,
            fontSize: fontSize,
          }}>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
                ),
                code: ({node, inline, ...props}) =>
                  inline ? (
                    <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
                  ) : (
                    <code className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto" {...props} />
                  ),
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}