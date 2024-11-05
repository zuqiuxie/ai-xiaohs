import ReactMarkdown from 'react-markdown'
import { forwardRef } from 'react'

interface MarkdownCardProps {
  title: string;
  content: string;
  font: string;
  fontSize: string;
  backgroundColor: string;
}

const MarkdownCard = forwardRef<HTMLDivElement, MarkdownCardProps>(
  ({ title, content, font, fontSize, backgroundColor }, ref) => {
    const titleSize = `${parseInt(fontSize) + 2}px`
    const contentSize = fontSize
    const h1Size = `${parseInt(fontSize) + 4}px`
    const h2Size = `${parseInt(fontSize) + 2}px`
    const h3Size = `${parseInt(fontSize) + 1}px`

    return (
      <div
        ref={ref}
        data-card
        className="w-[360px] h-[480px] overflow-y-auto rounded-xl shadow-lg"
        style={{
          backgroundColor,
        }}>
        <div className="p-6 h-full">
          <h1
            className="text-xl font-medium mb-6 text-center tracking-tight text-gray-900"
            style={{
              fontFamily: font,
              fontSize: titleSize,
            }}>
            {title || '标题'}
          </h1>
          <div
            className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm flex-1"
            style={{
              fontFamily: font,
            }}>
            <div className="prose prose-sm max-w-none text-gray-900">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => (
                    <h1
                      className="font-bold mb-4 text-gray-900"
                      style={{ fontSize: h1Size }}
                      {...props}
                    />
                  ),
                  h2: ({node, ...props}) => (
                    <h2
                      className="font-bold mb-3 text-gray-900"
                      style={{ fontSize: h2Size }}
                      {...props}
                    />
                  ),
                  h3: ({node, ...props}) => (
                    <h3
                      className="font-bold mb-2 text-gray-900"
                      style={{ fontSize: h3Size }}
                      {...props}
                    />
                  ),
                  p: ({node, ...props}) => (
                    <p
                      className="mb-4 leading-relaxed text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  ul: ({node, ...props}) => (
                    <ul
                      className="list-disc pl-4 mb-4 text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  ol: ({node, ...props}) => (
                    <ol
                      className="list-decimal pl-4 mb-4 text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  li: ({node, ...props}) => (
                    <li
                      className="mb-1 text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote
                      className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  code: ({node, inline, ...props}) =>
                    inline ? (
                      <code
                        className="bg-gray-100 rounded px-1 py-0.5 text-gray-800"
                        style={{ fontSize: contentSize }}
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto text-gray-800"
                        style={{ fontSize: contentSize }}
                        {...props}
                      />
                    ),
                  strong: ({node, ...props}) => (
                    <strong
                      className="font-bold text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
                  em: ({node, ...props}) => (
                    <em
                      className="italic text-gray-900"
                      style={{ fontSize: contentSize }}
                      {...props}
                    />
                  ),
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
)

MarkdownCard.displayName = 'MarkdownCard'

export default MarkdownCard