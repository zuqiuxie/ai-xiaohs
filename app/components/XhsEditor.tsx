'use client';

import { useState, useRef, useEffect } from 'react';
import { EditorState, Section, TemplateType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import AIContentEditor from './AIContentEditor';
import MarkdownCard from './MarkdownCard';
import { useAnalytics } from '../hooks/useAnalytics';

const defaultSection: Section = {
  id: uuidv4(),
  title: '',
  content: '',
};

export type CardType = 'column' | 'text' | 'ai'

const XhsEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    template: 'knowledge',
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

      // 3. 设置克隆元素的基础样式
      clone.style.width = `${width}px`;
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.maxHeight = 'none';
      clone.style.transform = 'none';
      clone.style.position = 'static';

      // 4. 特别处理列表和背景样式
      const applyStyles = (element: HTMLElement) => {
        // 处理内容区背景卡片
        const contentCard = element.querySelector('.bg-white\\/60');
        if (contentCard instanceof HTMLElement) {
          contentCard.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          contentCard.style.backdropFilter = 'blur(8px)';
          contentCard.style.borderRadius = '0.5rem';
          contentCard.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }

        // 处理有序列表
        const orderedLists = element.querySelectorAll('ol');
        orderedLists.forEach(ol => {
          if (ol instanceof HTMLElement) {
            ol.style.listStyle = 'none';  // 移除默认序号
            ol.style.counterReset = 'item';  // 重置计数器
            ol.style.paddingLeft = '0';
            ol.style.marginLeft = '0';
          }
        });

        // 处理无序列表
        const unorderedLists = element.querySelectorAll('ul');
        unorderedLists.forEach(ul => {
          if (ul instanceof HTMLElement) {
            ul.style.listStyle = 'none';  // 移除默认圆点
            ul.style.paddingLeft = '0';
            ul.style.marginLeft = '0';
          }
        });

        // 处理列表项
        const listItems = element.querySelectorAll('li');
        listItems.forEach((li, index) => {
          if (li instanceof HTMLElement) {
            const isOrderedList = li.parentElement?.tagName.toLowerCase() === 'ol';
            const isUnorderedList = li.parentElement?.tagName.toLowerCase() === 'ul';

            li.style.position = 'relative';
            li.style.paddingLeft = '2em';  // 为序号/圆点预留空间
            li.style.marginBottom = '0.5em';
            li.style.lineHeight = '1.6';
            li.style.display = 'block';

            // 创建序号/圆点容器
            const marker = document.createElement('span');
            marker.style.position = 'absolute';
            marker.style.left = '0';
            marker.style.top = '0';
            marker.style.width = '1.5em';
            marker.style.textAlign = 'right';
            marker.style.paddingRight = '0.5em';

            if (isOrderedList) {
              marker.textContent = `${index + 1}.`;
              marker.style.color = '#111827';  // text-gray-900
            } else if (isUnorderedList) {
              marker.textContent = '•';
              marker.style.color = '#111827';  // text-gray-900
            }

            // 插入序号/圆点到列表项开头
            li.insertBefore(marker, li.firstChild);
          }
        });
      };

      // 应用样式
      applyStyles(clone);

      // 5. 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      // 6. 获取实际内容高度
      const contentHeight = clone.scrollHeight;
      const minHeight = (width * 4) / 3;
      const exportHeight = Math.max(contentHeight, minHeight);
      clone.style.height = `${exportHeight}px`;

      // 7. 配置 html2canvas 选项
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
        logging: false,
        width: width,
        height: exportHeight,
        windowWidth: width,
        windowHeight: exportHeight,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-card]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.width = `${width}px`;
            clonedElement.style.height = `${exportHeight}px`;
            clonedElement.style.overflow = 'visible';
            clonedElement.style.transform = 'none';

            // 在克隆文档中再次应用样式
            applyStyles(clonedElement);
          }
        },
      });

      // 8. 创建下载链接
      const link = document.createElement('a');
      link.download = `小红书卡片_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 1.0);
      link.click();

      // 9. 清理临时元素
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
    // 中文字体名称映射
    const fontMap: Record<string, string> = {
      思源黑体: '"Source Han Sans SC", "Noto Sans SC", sans-serif',
      思源宋体: '"Source Han Serif SC", "Noto Serif SC", serif',
      霞鹜文楷: '"LXGW WenKai", serif',
      楷体: 'KaiTi, STKaiti, serif',
      宋体: 'SimSun, serif',
      黑体: 'SimHei, sans-serif',
    };

    return {
      fontFamily: fontMap[font] || font,
    };
  };

  // 知识干货模板
  const KnowledgeCard = () => (
    <div
      ref={cardRef}
      data-card
      className="w-[360px] h-[480px] overflow-y-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm"
      style={{
        backgroundColor: editorState.backgroundColor,
      }}>
      <div className="p-6 h-full">
        <h1
          className="text-xl font-medium mb-6 text-center tracking-tight"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: parseInt(editorState.fontSize) + 2 + 'px',
          }}>
          {editorState.title || '标题'}
        </h1>
        <div className="space-y-4">
          {editorState.sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-xl p-4 transition-all duration-200"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <h2
                className="text-base font-medium tracking-tight mb-2"
                style={{
                  fontFamily: getFontStyle(editorState.font).fontFamily,
                  fontSize: editorState.fontSize,
                }}>
                {section.title || `小节 ${index + 1}`}
              </h2>
              <p
                className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed pl-2.5 min-h-[2.5em]"
                style={{
                  fontFamily: getFontStyle(editorState.font).fontFamily,
                  fontSize: editorState.fontSize,
                }}>
                {section.content || '内容描述...'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 个人思考模板
  const ThinkingCard = () => (
    <div
      ref={cardRef}
      data-card
      className="w-[360px] h-[480px] overflow-y-auto rounded-xl shadow-lg"
      style={{
        backgroundColor: editorState.backgroundColor,
      }}>
      <div className="p-6 h-full flex flex-col">
        <h1
          className="text-lg font-bold mb-6 text-center"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: parseInt(editorState.fontSize) + 2 + 'px',
          }}>
          {editorState.title || '标题'}
        </h1>
        <div
          className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm flex-1"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: editorState.fontSize,
          }}>
          <div className="text-gray-700 whitespace-pre-wrap min-h-[2.5em]" style={{ lineHeight: '1.8' }}>
            {editorState.sections[0]?.content || '输入内容...'}
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 顶部标题区 */}
        <div className="flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            小红书
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              图文卡片
            </span>
            生成器
          </h1>
          <p className="text-gray-600 text-base md:text-lg text-center max-w-2xl mx-auto">
            3分钟快速生成精美图文内容，一键导出分享
          </p>
        </div>

        {/* 主要内容区 - 移除卡片样式，减小内边距和间距 */}
        <div className="mt-4">
          {/* 模板选择区 - 减小上下间距 */}
          <div className="mb-3">
            <div className="inline-flex p-0.5 bg-gray-100/80 rounded-lg">
              <button
                className={`px-4 py-1.5 rounded-md transition-all duration-300 text-sm ${
                  editorState.template === 'knowledge'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTemplateChange('knowledge')}>
                分栏卡片
              </button>
              <button
                className={`px-4 py-1.5 rounded-md transition-all duration-300 text-sm ${
                  editorState.template === 'thinking'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTemplateChange('thinking')}>
                纯文本卡片
              </button>
              <button
                className={`px-4 py-1.5 rounded-md transition-all duration-300 text-sm ${
                  editorState.template === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTemplateChange('ai')}>
                AI卡片
              </button>
            </div>
          </div>

          <div className="flex gap-8 h-[calc(100vh-220px)]">
            {/* 左侧编辑区 - 添加固定高度和滚动控制 */}
            <div className="flex-1 max-w-2xl flex flex-col">
              {/* 样式设置区 - 设为 flex-shrink-0 防止压缩 */}
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
                        <option value="思源黑体">思源黑体</option>
                        <option value="思源宋体">思源宋体</option>
                        <option value="霞鹜文楷">霞鹜文楷</option>
                        <option value="楷体">楷体</option>
                        <option value="宋体">宋体</option>
                        <option value="黑体">黑体</option>
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
                        { color: '#F3E6FF', name: '梦幻紫' },
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

              {/* 内容编辑区 - 添加 flex-1 和 overflow-auto */}
              <div className="bg-white/60 rounded-lg p-3 flex-1 overflow-auto">
                <h3 className="text-xs font-medium text-gray-900 mb-2">内容编辑</h3>
                <div className="space-y-4">
                  {/* 移除条件判断，始终显示标题输入 */}
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

                  {editorState.template === 'knowledge' && (
                    <div className="space-y-4" ref={contentEditRef}>
                      {editorState.sections.map((section, index) => (
                        <div key={section.id} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="text"
                              value={section.title}
                              onChange={e => {
                                const newSections = [...editorState.sections];
                                newSections[index].title = e.target.value;
                                setEditorState(prev => ({ ...prev, sections: newSections }));
                              }}
                              placeholder={`小节标题 ${index + 1}`}
                              className="flex-1 px-3 py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {editorState.sections.length > 1 && (
                              <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                                删除
                              </button>
                            )}
                          </div>
                          <textarea
                            value={section.content}
                            onChange={e => {
                              const newSections = [...editorState.sections];
                              newSections[index].content = e.target.value;
                              setEditorState(prev => ({ ...prev, sections: newSections }));
                            }}
                            placeholder="请输入内容"
                            className="w-full px-3 py-2 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-none"
                          />
                        </div>
                      ))}
                      {editorState.sections.length < 5 && (
                        <button
                          onClick={handleAddSection}
                          className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors text-sm">
                          + 添加小节
                        </button>
                      )}
                    </div>
                  )}

                  {editorState.template === 'thinking' && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <textarea
                        value={editorState.sections[0]?.content || ''}
                        onChange={e => {
                          const newSections = [
                            {
                              ...defaultSection,
                              id: editorState.sections[0]?.id || uuidv4(),
                              content: e.target.value,
                            },
                          ];
                          setEditorState(prev => ({ ...prev, sections: newSections }));
                        }}
                        placeholder="请输入内容..."
                        className="w-full px-3 py-2 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[300px] resize-none"
                        style={{
                          fontFamily: editorState.font,
                          fontSize: editorState.fontSize,
                          lineHeight: '1.8',
                        }}
                      />
                    </div>
                  )}

                  {editorState.template === 'ai' && (
                    <AIContentEditor
                      title={editorState.title}
                      onContentGenerated={(content) => {
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

            {/* 右侧预览区 - 保持不变 */}
            <div className="w-[380px] flex-shrink-0">
              <div className="flex flex-col items-start space-y-3">
                <div className="relative group">
                  {editorState.template === 'knowledge' && <KnowledgeCard />}
                  {editorState.template === 'thinking' && <ThinkingCard />}
                  {editorState.template === 'ai' && (
                    <MarkdownCard
                      ref={cardRef}
                      title={editorState.title}
                      content={editorState.sections[0]?.content || ''}
                      font={getFontStyle(editorState.font).fontFamily}
                      fontSize={editorState.fontSize}
                      backgroundColor={editorState.backgroundColor}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleDownload('png')}
                  className="w-[360px] px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
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
  );
};

export default XhsEditor;
