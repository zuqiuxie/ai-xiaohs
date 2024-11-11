'use client';

import { useState, useRef, useEffect } from 'react';
import { EditorState, Section, TemplateType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import AIContentEditor from './AIContentEditor';
import MarkdownCard from './MarkdownCard';
import { useAnalytics } from '../hooks/useAnalytics';
import HotPostEditor from './HotPostEditor';

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

  // 创建一个 Toast 组件函数
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // 移除已存在的 toast
    const existingToast = document.getElementById('global-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }

    const toast = document.createElement('div');
    toast.id = 'global-toast'; // 添加唯一 ID
    toast.className = `
      fixed top-6 left-1/2 -translate-x-1/2 z-50
      px-4 py-2 rounded-lg
      ${type === 'success' ? 'bg-gray-800/90' : 'bg-red-500/90'} backdrop-blur-sm
      text-white text-sm font-medium
      shadow-lg
      flex items-center gap-2
      transform transition-all duration-300 ease-out
      opacity-0 translate-y-[-1rem]
    `;

    // 设置图标
    const icon = type === 'success'
      ? `<svg class="w-4 h-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
           <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
         </svg>`
      : `<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
           <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
         </svg>`;

    toast.innerHTML = `${icon}<span>${message}</span>`;

    document.body.appendChild(toast);

    // 使用 requestAnimationFrame 确保 DOM 更新后再添加动画
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });

    // 创建一个移除函数
    const removeToast = () => {
      const toastElement = document.getElementById('global-toast');
      if (toastElement && toastElement.parentNode) {
        toastElement.style.opacity = '0';
        toastElement.style.transform = 'translate(-50%, -1rem)';

        // 只添加一次事件监听器
        const handleTransitionEnd = () => {
          if (toastElement.parentNode) {
            toastElement.removeEventListener('transitionend', handleTransitionEnd);
            toastElement.parentNode.removeChild(toastElement);
          }
        };

        toastElement.addEventListener('transitionend', handleTransitionEnd);
      }
    };

    // 3秒后移除
    setTimeout(removeToast, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 顶部标题区 */}
        <div className="flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            小红书
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              AI卡片
            </span>
            生成器
          </h1>
          <p className="text-gray-600 text-base md:text-lg text-center max-w-2xl mx-auto">
            3分钟快速生成精美图文内容，一键导出分享
          </p>
        </div>

        {/* 主要内容区 */}
        <div className="mt-4">
          {/* 添加模板选择区 */}
          <div className="mb-3">
            <div className="inline-flex p-0.5 bg-gray-100/80 rounded-lg">
              <button
                className={`px-4 py-1.5 rounded-md transition-all duration-300 text-sm ${
                  editorState.template === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTemplateChange('ai')}>
                AI卡片
              </button>
              <button
                className={`px-4 py-1.5 rounded-md transition-all duration-300 text-sm ${
                  editorState.template === 'hot_post'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTemplateChange('hot_post')}>
                爆款跟写
              </button>
            </div>
          </div>

          <div className="flex gap-8 h-[calc(100vh-220px)]">
            {/* 左侧编辑区 */}
            <div className="flex-1 max-w-2xl flex flex-col">
              {/* 样式设置区 */}
              <div className="bg-white/60 rounded-lg p-3 mb-3 flex-shrink-0">
                <h3 className="text-xs font-medium text-gray-900 mb-2">样式设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">字体</label>
                      <select
                        value={editorState.font}
                        onChange={e => handleStyleChange('font', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all">
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
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">字号</label>
                      <select
                        value={editorState.fontSize}
                        onChange={e => handleStyleChange('fontSize', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all">
                        <option value="12px">12px - 小号</option>
                        <option value="14px">14px - 正常</option>
                        <option value="15px">15px - 中等</option>
                        <option value="16px">16px - 偏大</option>
                        <option value="18px">18px - 大号</option>
                        <option value="20px">20px - 特大</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">背景色</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { color: '#E6F7F3', name: '薄荷绿' },
                        { color: '#F3E6FF', name: '梦紫' },
                        { color: '#FFF3E6', name: '暖阳橙' },
                        { color: '#E6F0FF', name: '天空蓝' },
                        { color: '#FFE6E6', name: '樱花粉' },
                        { color: '#F5F5F5', name: '简约灰' },
                        { color: '#E8F4D9', name: '清新绿' },
                        { color: '#FCE6E6', name: '珊瑚红' },
                        { color: '#E6ECF4', name: '深海蓝' },
                        { color: '#F9E9F9', name: '浪漫紫' },
                        { color: '#FFF0E1', name: '奶茶棕' },
                        { color: '#EDF3F7', name: '云雾蓝' },
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          className={`group relative w-7 h-7 rounded-full transition-all duration-300 ${
                            editorState.backgroundColor === color
                              ? 'ring-2 ring-offset-2 ring-blue-500/30 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleStyleChange('backgroundColor', color)}>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 内容编辑区 */}
              <div className="bg-white/60 rounded-lg p-3 flex-1 overflow-auto">
                <h3 className="text-xs font-medium text-gray-900 mb-2">内容编辑</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">标题</label>
                    <input
                      type="text"
                      value={editorState.title}
                      onChange={e => handleTitleChange(e.target.value)}
                      placeholder="输入标题"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {editorState.template === 'ai' ? (
                    <AIContentEditor
                      title={editorState.title}
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
              <div className="flex flex-col items-start space-y-4">
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

                {/* 操作按钮区 */}
                <div className="w-[360px] flex gap-2">
                  {/* 复制文本按钮 */}
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(editorState.sections[0]?.content || '');
                        showToast('已复制到剪贴板');
                      } catch (err) {
                        console.error('Failed to copy:', err);
                        showToast('复制失败，请重试', 'error');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    复制文本
                  </button>

                  {/* 下载图片按钮 */}
                  <button
                    onClick={() => handleDownload('png')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    下载图片
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XhsEditor;
