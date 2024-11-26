import ReactMarkdown from 'react-markdown';
import { forwardRef, useState } from 'react';

interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

interface MarkdownCardProps {
  title: string;
  content: string;
  font: string;
  fontSize: string;
  backgroundColor: { from: string; to: string };
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  onDownload?: () => void;
}

const MarkdownCard = forwardRef<HTMLDivElement, MarkdownCardProps>(
  ({ content, font, fontSize, backgroundColor, onContentChange, onTitleChange, onDownload }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const contentSize = fontSize;
    const h1Size = `${parseInt(fontSize) + 4}px`;
    const h2Size = `${parseInt(fontSize) + 2}px`;
    const h3Size = `${parseInt(fontSize) + 1}px`;




    return (
      <div
        ref={ref}
        data-card
        className="w-full sm:w-[360px] min-h-[512px] max-h-[512px] overflow-y-auto rounded-xl shadow-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 print:overflow-visible print:max-h-none relative group"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor.from} 0%, ${backgroundColor.to} 100%)`
          // 使用 135deg 对角线渐变，从左上到右下
        }}>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
          title={isEditing ? '完成编辑' : '编辑内容'}>
          {isEditing ? (
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          )}
        </button>

        <div className="p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm" style={{ fontFamily: font }}>
            {!content && !isEditing ? (
              <div className="h-[432px] flex flex-col items-center justify-center text-gray-400 space-y-4">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9.5 3H5.5C4.11929 3 3 4.11929 3 5.5V9.5C3 10.8807 4.11929 12 5.5 12H9.5C10.8807 12 12 10.8807 12 9.5V5.5C12 4.11929 10.8807 3 9.5 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 3H14.5C13.1193 3 12 4.11929 12 5.5V9.5C12 10.8807 13.1193 12 14.5 12H18.5C19.8807 12 21 10.8807 21 9.5V5.5C21 4.11929 19.8807 3 18.5 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.5 12H5.5C4.11929 12 3 13.1193 3 14.5V18.5C3 19.8807 4.11929 21 5.5 21H9.5C10.8807 21 12 19.8807 12 18.5V14.5C12 13.1193 10.8807 12 9.5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18.5 12H14.5C13.1193 12 12 13.1193 12 14.5V18.5C12 19.8807 13.1193 21 14.5 21H18.5C19.8807 21 21 19.8807 21 18.5V14.5C21 13.1193 19.8807 12 18.5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">等待生成内容</p>
                  <p className="text-xs">请在左侧输入配置信息，点击按钮生成内容</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={e => onContentChange?.(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[432px] resize-none"
                    style={{ fontSize: contentSize, lineHeight: '1.6' }}
                    placeholder="输入内容..."
                  />
                ) : (
                  <ReactMarkdown
                    components={{
                      h1: ({ children, ...props }: ComponentProps) => (
                        <h1
                          className="text-xl font-bold mb-4 text-gray-900 break-words"
                          style={{ fontSize: h1Size }}
                          {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }: ComponentProps) => (
                        <h2
                          className="text-lg font-bold mb-3 text-gray-900 break-words"
                          style={{ fontSize: h2Size }}
                          {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }: ComponentProps) => (
                        <h3
                          className="text-base font-bold mb-2 text-gray-900 break-words"
                          style={{ fontSize: h3Size }}
                          {...props}>
                          {children}
                        </h3>
                      ),
                      p: ({ children, ...props }: ComponentProps) => (
                        <p
                          className="mb-2 text-gray-900 whitespace-pre-wrap"
                          style={{
                            fontSize: contentSize,
                            lineHeight: '1.6',
                          }}
                          {...props}>
                          {children}
                        </p>
                      ),
                      ul: ({ children, ...props }: ComponentProps) => (
                        <ul
                          className="list-disc mb-2 text-gray-900"
                          style={{
                            fontSize: contentSize,
                            lineHeight: '1.6',
                            paddingLeft: '1.2em',
                          }}
                          {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }: ComponentProps) => (
                        <ol
                          className="list-decimal mb-2 text-gray-900"
                          style={{
                            fontSize: contentSize,
                            lineHeight: '1.6',
                            paddingLeft: '1.2em',
                          }}
                          {...props}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }: ComponentProps) => (
                        <li
                          className="mb-1 text-gray-900"
                          style={{
                            fontSize: contentSize,
                            lineHeight: '1.6',
                          }}
                          {...props}>
                          {children}
                        </li>
                      ),
                      blockquote: ({ children, ...props }: ComponentProps) => (
                        <blockquote
                          className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700 break-words"
                          style={{ fontSize: contentSize }}
                          {...props}>
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, inline, ...props }: ComponentProps & { inline?: boolean }) => {
                        return inline ? (
                          <code
                            className="bg-gray-100 rounded px-1 py-0.5 text-gray-800 break-words"
                            style={{ fontSize: contentSize }}
                            {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto">
                            <code className="text-gray-800 break-words" style={{ fontSize: contentSize }} {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      strong: ({ children, ...props }: ComponentProps) => (
                        <strong
                          className="font-bold text-gray-900 break-words"
                          style={{ fontSize: contentSize }}
                          {...props}>
                          {children}
                        </strong>
                      ),
                      em: ({ children, ...props }: ComponentProps) => (
                        <em className="italic text-gray-900 break-words" style={{ fontSize: contentSize }} {...props}>
                          {children}
                        </em>
                      ),
                    }}>
                    {content}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

MarkdownCard.displayName = 'MarkdownCard';

export default MarkdownCard;
