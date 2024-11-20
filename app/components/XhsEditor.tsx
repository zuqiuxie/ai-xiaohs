'use client';

import { useState, useRef, useEffect } from 'react';
import { EditorState, Section, TemplateType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import AIContentEditor from './AIContentEditor';
import MarkdownCard from './MarkdownCard';
import { useAnalytics } from '../hooks/useAnalytics';
import HotPostEditor from './HotPostEditor';
import { showToast } from '@/app/utils/toast';
import ErrorBoundary from './ErrorBoundary';

const defaultSection: Section = {
  id: uuidv4(),
  title: '',
  content: '',
};

export type CardType = 'column' | 'text' | 'ai';

const FONT_OPTIONS = {
  中文简约: [
    { label: '思源黑体', value: '"Source Han Sans SC", "Noto Sans SC", sans-serif' },
    { label: '思源宋体', value: '"Source Han Serif SC", "Noto Serif SC", serif' },
    { label: '阿里巴巴普惠体', value: '"Alibaba PuHuiTi", sans-serif' },
    { label: '站酷高端黑', value: '"ZCOOL QingKe HuangYou", sans-serif' },
    { label: '方正兰亭黑', value: '"FZLanTingHei", sans-serif' },
  ],
  中文传统: [
    { label: '霞鹜文楷', value: '"LXGW WenKai", serif' },
    { label: '楷体', value: 'KaiTi, STKaiti, serif' },
    { label: '宋体', value: 'SimSun, serif' },
    { label: '黑体', value: 'SimHei, sans-serif' },
    { label: '仿宋', value: 'FangSong, STFangSong, serif' },
  ],
  英文现代: [
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Roboto', value: '"Roboto", sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Montserrat', value: '"Montserrat", sans-serif' },
    { label: 'Poppins', value: '"Poppins", sans-serif' },
  ],
  英文经典: [
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Merriweather', value: '"Merriweather", serif' },
    { label: 'Lora', value: '"Lora", serif' },
    { label: 'Crimson Pro', value: '"Crimson Pro", serif' },
    { label: 'Garamond', value: '"EB Garamond", serif' },
  ],
  手写风格: [
    { label: '手写体', value: '"Ma Shan Zheng", cursive' },
    { label: '潇洒体', value: '"Liu Jian Mao Cao", cursive' },
    { label: '有爱体', value: '"Zhi Mang Xing", cursive' },
    { label: 'Caveat', value: '"Caveat", cursive' },
    { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  ],
};

// 添加新的样式常量
const GRADIENT_TEXT = `
  bg-clip-text text-transparent
  bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500
`;

const XhsEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    template: 'ai',
    title: '',
    font: '思源黑体',
    fontSize: '16px',
    backgroundColor: '#E6F7F3',
    sections: [{ ...defaultSection }],
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const contentEditRef = useRef<HTMLDivElement>(null);

  const { trackEvent } = useAnalytics();

  // 在组件加载时记录页面访问
  useEffect(() => {
    trackEvent('page_view', {
      page: 'editor',
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleTemplateChange = (template: TemplateType) => {
    setEditorState(prev => ({
      ...prev,
      template,
      sections: [{ ...defaultSection }],
    }));

    // 记录模板切换事件
    trackEvent('change_template', {
      template_type: template,
      timestamp: new Date().toISOString(),
    });
  };

  const handleAddSection = () => {
    setEditorState(prev => ({
      ...prev,
      sections: [...prev.sections, { ...defaultSection, id: uuidv4() }],
    }));

    setTimeout(() => {
      if (contentEditRef.current) {
        const newSectionElement = contentEditRef.current.lastElementChild;
        if (newSectionElement) {
          newSectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleRemoveSection = (id: string) => {
    setEditorState(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id),
    }));
  };

  // 下载函数
  const handleDownload = async (format: 'png' | 'jpg' | 'jpeg') => {
    if (!cardRef.current) return;

    try {
      const previewElement = cardRef.current;
      const { width } = previewElement.getBoundingClientRect();

      // 1. 创建临时容器
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      // 2. 克隆预览元素
      const clone = previewElement.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(clone);

      // 3. 设置基础样式
      clone.style.width = `${width}px`;
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.transform = 'none';
      clone.style.position = 'static';
      clone.style.backgroundColor = editorState.backgroundColor;

      // 4. 处理内容样式
      const contentCards = clone.querySelectorAll('.bg-white\\/60');
      contentCards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          card.style.backdropFilter = 'blur(8px)';
          card.style.borderRadius = '0.5rem';
          card.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }
      });

      // 5. 处理文本样式
      const textElements = clone.querySelectorAll('h1, h2, h3, p, li');
      textElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.fontFamily = getFontStyle(editorState.font).fontFamily;
          element.style.fontSize = editorState.fontSize;
          element.style.lineHeight = '1.6';
        }
      });

      // 特别处理有序列表
      const orderedLists = clone.querySelectorAll('ol');
      orderedLists.forEach(list => {
        if (list instanceof HTMLElement) {
          list.style.listStyle = 'decimal';
          list.style.paddingLeft = '0';
          list.style.margin = '0';

          // 处理列表项
          const items = list.querySelectorAll('li');
          items.forEach((item, index) => {
            if (item instanceof HTMLElement) {
              // 设置列表项样式
              item.style.display = 'block';
              item.style.position = 'relative';
              item.style.paddingLeft = '2em';
              item.style.marginBottom = '0.75em';

              // 创建序号元素
              const number = document.createElement('span');
              number.textContent = `${index + 1}.`;
              number.style.position = 'absolute';
              number.style.left = '0';
              number.style.top = '0';
              number.style.fontFamily = getFontStyle(editorState.font).fontFamily;
              number.style.fontSize = editorState.fontSize;
              number.style.lineHeight = '1.6';
              number.style.minWidth = '1.5em';

              // 插入序号到列表项开头
              item.insertBefore(number, item.firstChild);
            }
          });
        }
      });

      // 特别处理无序列表
      const unorderedLists = clone.querySelectorAll('ul');
      unorderedLists.forEach(list => {
        if (list instanceof HTMLElement) {
          list.style.listStyle = 'none';
          list.style.paddingLeft = '0';
          list.style.margin = '0';

          // 处理列表项
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            if (item instanceof HTMLElement) {
              // 设置列表项样式
              item.style.display = 'block';
              item.style.position = 'relative';
              item.style.paddingLeft = '2em';
              item.style.marginBottom = '0.75em';

              // 创建圆点元素
              const bullet = document.createElement('span');
              bullet.textContent = '•';
              bullet.style.position = 'absolute';
              bullet.style.left = '0.5em';
              bullet.style.top = '0';
              bullet.style.fontFamily = getFontStyle(editorState.font).fontFamily;
              bullet.style.fontSize = editorState.fontSize;
              bullet.style.lineHeight = '1.6';

              // 插入圆点到列表项开头
              item.insertBefore(bullet, item.firstChild);
            }
          });
        }
      });

      // 6. 等待样式应用
      await new Promise(resolve => setTimeout(resolve, 200));

      // 7. 设置导出尺寸
      const contentHeight = clone.scrollHeight;
      const minHeight = (width * 4) / 3;
      const exportHeight = Math.max(contentHeight, minHeight);
      clone.style.height = `${exportHeight}px`;

      // 8. 生成图片
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
        logging: false,
        width,
        height: exportHeight,
        windowWidth: width,
        windowHeight: exportHeight,
        useCORS: true,
        allowTaint: true,
        onclone: clonedDoc => {
          const clonedElement = clonedDoc.querySelector('[data-card]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.width = `${width}px`;
            clonedElement.style.height = `${exportHeight}px`;
            clonedElement.style.overflow = 'visible';
          }
        },
      });

      // 9. 下载图片
      const link = document.createElement('a');
      link.download = `小红书卡片_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 1.0);
      link.click();

      // 10. 清理临时元素
      document.body.removeChild(tempContainer);

      // 记录下载事件
      trackEvent('download_image', {
        format,
        template_type: editorState.template,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 辅助函数：获取字体样式
  const getFontStyle = (font: string) => {
    return {
      fontFamily: font, // 直接使用字体值，因为现在我们存储的就是完整的 font-family 字符串
    };
  };

  // 在样式改变时记录
  const handleStyleChange = (type: 'font' | 'fontSize' | 'backgroundColor', value: string) => {
    setEditorState(prev => ({ ...prev, [type]: value }));

    trackEvent('change_style', {
      style_type: type,
      style_value: value,
      timestamp: new Date().toISOString(),
    });
  };

  // 在 XhsEditor 组件中添加新的处理函数
  const handleTitleChange = (value: string) => {
    setEditorState(prev => ({ ...prev, title: value }));
  };

  // 在 XhsEditor 组件中添加处理函数
  const handleCardContentChange = (content: string) => {
    const newSections = [
      {
        ...defaultSection,
        id: editorState.sections[0]?.id || uuidv4(),
        content: content,
      },
    ];
    setEditorState(prev => ({ ...prev, sections: newSections }));
  };

  const handleCardTitleChange = (title: string) => {
    setEditorState(prev => ({ ...prev, title }));
  };

  // 添加一个辅助函数来转换 Markdown 为纯文本
  const convertMarkdownToPlainText = (markdown: string): string => {
    let text = markdown;

    // 处理标题
    text = text.replace(/^#\s+(.*)$/m, '$1\n');
    text = text.replace(/^##\s+(.*)$/gm, '$1\n');
    text = text.replace(/^###\s+(.*)$/gm, '$1\n');

    // 处理列表
    text = text.replace(/^\d+\.\s+(.*)$/gm, '$1'); // 有序列表
    text = text.replace(/^[-*]\s+(.*)$/gm, '$1'); // 无序列表

    // 处理强调语法
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // 粗体
    text = text.replace(/__(.*?)__/g, '$1'); // 粗体替代语法
    text = text.replace(/\*(.*?)\*/g, '$1'); // 斜体
    text = text.replace(/_(.*?)_/g, '$1'); // 斜体替代语法

    // 处理链接和图片
    text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // 图片
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // 链接

    // 处理代码块和行内代码
    text = text.replace(/```[\s\S]*?```/g, ''); // 代码块
    text = text.replace(/`([^`]+)`/g, '$1'); // 行内代码

    // 处理引用
    text = text.replace(/^>\s*(.*?)$/gm, '$1');

    // 处理水平线
    text = text.replace(/^[-*_]{3,}$/gm, '\n');

    // 处理多余的空行
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  };

  // 确保正确传递 onContentGenerated
  const handleContentGenerated = (content: string) => {
    console.log('Content received in XhsEditor:', content);
    // 更新状态
    const newSections = [
      {
        ...defaultSection,
        id: editorState.sections[0]?.id || uuidv4(),
        content: content,
      },
    ];
    console.log('Updating sections with:', newSections);
    setEditorState(prev => {
      const newState = { ...prev, sections: newSections };
      console.log('New editor state:', newState);
      return newState;
    });
  };

  return (
    <ErrorBoundary>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 调整头部区域的高度和间距 */}
          <header className="h-[120px] pt-6 flex flex-col justify-center">
            {/* 主标题 - 调整间距和大小 */}
            <h1 className="inline-flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">小红书图文生成器</span>
              <span className={`text-xl sm:text-2xl font-bold ${GRADIENT_TEXT}`}>让创作自由起飞</span>
            </h1>

            {/* 副标题 - 调整上边距和大小 */}
            <p className="mt-1.5 max-w-2xl mx-auto text-sm text-gray-600">
              <span className="inline-flex items-center flex-wrap justify-center gap-2">
                <span className="font-medium text-gray-900">AI智能创作</span>
                <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="font-medium text-gray-900">一键排版</span>
                <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="font-medium text-gray-900">即时导出</span>
              </span>
            </p>
          </header>

          {/* 调整主内容区域的高度计算 */}
          <div className="h-[calc(100vh-120px)]">
            {/* 模板选择区 */}
            <div className="h-[40px] flex items-center">
              <div className="inline-flex p-0.5 bg-gray-100/80 rounded-lg">
                <button
                  className={`px-3 py-1 rounded-md transition-all duration-300 text-sm ${
                    editorState.template === 'ai'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => handleTemplateChange('ai')}>
                  灵感创作
                </button>
                <button
                  className={`px-3 py-1 rounded-md transition-all duration-300 text-sm ${
                    editorState.template === 'hot_post'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => handleTemplateChange('hot_post')}>
                  爆款仿写
                </button>
              </div>
            </div>

            {/* 编辑区域 - 使用剩余高度 */}
            <div className="h-[calc(100vh-140px)] flex gap-6">
              {/* 左侧编辑区 */}
              <div className="flex-1 max-w-2xl flex flex-col">
                {/* 样式设置区 */}
                <div className="h-[40px] bg-white/60 rounded-lg p-2 mb-2 flex-shrink-0">
                  <div className="grid grid-cols-12 gap-3">
                    {/* 字体和字号选择 */}
                    <div className="col-span-5">
                      <select
                        value={editorState.font}
                        onChange={e => handleStyleChange('font', e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all">
                        {Object.entries(FONT_OPTIONS).map(([category, fonts]) => (
                          <optgroup key={category} label={category}>
                            {fonts.map(font => (
                              <option key={font.label} value={font.value}>
                                {font.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <select
                        value={editorState.fontSize}
                        onChange={e => handleStyleChange('fontSize', e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all">
                        <option value="14px">14px</option>
                        <option value="15px">15px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                      </select>
                    </div>

                    {/* 背景色选择 - 更多颜色选项 */}
                    <div className="col-span-4 flex items-center gap-1.5 pl-1">
                      {[
                        { color: '#E6F7F3', name: '薄荷绿' },
                        { color: '#F3E6FF', name: '梦幻紫' },
                        { color: '#FFF3E6', name: '暖阳橙' },
                        { color: '#E6F0FF', name: '天空蓝' },
                        { color: '#FFE6E6', name: '樱花粉' },
                        { color: '#F5F5F5', name: '简约灰' },
                        { color: '#E8F4D9', name: '清新绿' },
                        { color: '#FCE6E6', name: '珊瑚红' },
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          className={`group relative w-5 h-5 rounded-full transition-all duration-300 ${
                            editorState.backgroundColor === color
                              ? 'ring-2 ring-offset-1 ring-blue-500/30 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleStyleChange('backgroundColor', color)}>
                          <span
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500
                                         opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 内容编辑区 */}
                <div className="flex-1 bg-white/60 rounded-lg p-3 overflow-hidden">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={editorState.title}
                        onChange={e => handleTitleChange(e.target.value)}
                        placeholder="输入标题"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {editorState.template === 'ai' ? (
                      <AIContentEditor title={editorState.title} onContentGenerated={handleContentGenerated} />
                    ) : (
                      <HotPostEditor
                        onContentGenerated={content => {
                          const newSections = [
                            {
                              ...defaultSection,
                              id: editorState.sections[0]?.id || uuidv4(),
                              content: content,
                            },
                          ];
                          setEditorState(prev => ({ ...prev, sections: newSections }));
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧预览区 */}
              <div className="w-[380px] flex-shrink-0">
                {/* 预览卡片 */}
                <div className="relative group">
                  <MarkdownCard
                    ref={cardRef}
                    title={editorState.title}
                    content={editorState.sections[0]?.content || ''}
                    font={getFontStyle(editorState.font).fontFamily}
                    fontSize={editorState.fontSize}
                    backgroundColor={editorState.backgroundColor}
                    onContentChange={handleCardContentChange}
                    onTitleChange={handleCardTitleChange}
                  />
                </div>

                {/* 操作按钮 - 减小上边距 */}
                <div className="mt-3 flex gap-2">
                  {/* 复制文本按钮 */}
                  <button
                    onClick={async () => {
                      const content = editorState.sections[0]?.content || '';
                      if (!content.trim()) {
                        showToast('暂无内容可复制', 'error');
                        return;
                      }

                      try {
                        const plainText = convertMarkdownToPlainText(content);
                        await navigator.clipboard.writeText(plainText);
                        showToast('已复制到剪贴板');
                      } catch (err) {
                        console.error('Failed to copy:', err);
                        showToast('复制失败，请重试', 'error');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-white/80 hover:bg-white/95
                               border border-gray-200/50 backdrop-blur-sm
                               rounded-xl transition-all duration-200
                               text-sm font-medium text-gray-700
                               flex items-center justify-center gap-2
                               shadow-sm hover:shadow-md
                               group relative">
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span className="group-hover:text-blue-600 transition-colors">复制文本</span>
                  </button>

                  {/* 下载图片按钮 */}
                  <button
                    onClick={() => {
                      const content = editorState.sections[0]?.content || '';
                      if (!content.trim()) {
                        showToast('暂无内容可下载', 'error');
                        return;
                      }
                      handleDownload('png');
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500
                               hover:from-blue-600 hover:to-purple-600
                               text-white rounded-xl transition-all duration-200
                               text-sm font-medium shadow-sm hover:shadow-md
                               flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>下载图片</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default XhsEditor;
