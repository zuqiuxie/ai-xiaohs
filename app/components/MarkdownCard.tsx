import ReactMarkdown from 'react-markdown';
import { forwardRef } from 'react';

interface MarkdownCardProps {
  title: string;
  content: string;
  font: string;
  fontSize: string;
  backgroundColor: string;
}

// 修改 ComponentProps 接口以匹配 react-markdown 的类型
interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

const MarkdownCard = forwardRef<HTMLDivElement, MarkdownCardProps>(
  ({ title, content, font, fontSize, backgroundColor }, ref) => {
    const contentSize = fontSize;
    const h1Size = `${parseInt(fontSize) + 4}px`;
    const h2Size = `${parseInt(fontSize) + 2}px`;
    const h3Size = `${parseInt(fontSize) + 1}px`;

    return (
      <div
        ref={ref}
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
            }}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children, ...props }: ComponentProps) => (
                    <h1 className="text-xl font-bold mb-4 text-gray-900" style={{ fontSize: h1Size }} {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }: ComponentProps) => (
                    <h2 className="text-lg font-bold mb-3 text-gray-900" style={{ fontSize: h2Size }} {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }: ComponentProps) => (
                    <h3 className="text-base font-bold mb-2 text-gray-900" style={{ fontSize: h3Size }} {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }: ComponentProps) => (
                    <p className="mb-4 leading-relaxed text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }: ComponentProps) => (
                    <ul className="list-disc pl-4 mb-4 text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: ComponentProps) => (
                    <ol className="list-decimal pl-4 mb-4 text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }: ComponentProps) => (
                    <li className="mb-1 text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </li>
                  ),
                  blockquote: ({ children, ...props }: ComponentProps) => (
                    <blockquote
                      className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700"
                      style={{ fontSize: contentSize }}
                      {...props}>
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, inline, ...props }: ComponentProps & { inline?: boolean }) => {
                    return inline ? (
                      <code
                        className="bg-gray-100 rounded px-1 py-0.5 text-gray-800"
                        style={{ fontSize: contentSize }}
                        {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto">
                        <code className="text-gray-800" style={{ fontSize: contentSize }} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  strong: ({ children, ...props }: ComponentProps) => (
                    <strong className="font-bold text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }: ComponentProps) => (
                    <em className="italic text-gray-900" style={{ fontSize: contentSize }} {...props}>
                      {children}
                    </em>
                  ),
                }}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MarkdownCard.displayName = 'MarkdownCard';

export default MarkdownCard;
