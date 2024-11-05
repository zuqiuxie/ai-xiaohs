'use client';

import { useState, useRef } from 'react';
import { EditorState, Section, TemplateType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';

const defaultSection: Section = {
  id: uuidv4(),
  title: '',
  content: '',
};

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

  const handleTemplateChange = (template: TemplateType) => {
    setEditorState(prev => ({
      ...prev,
      template,
      sections: [{ ...defaultSection }],
    }));
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
      // 临时移除滚动样式
      const originalStyle = cardRef.current.style.overflow;
      cardRef.current.style.overflow = 'visible';
      cardRef.current.style.height = 'auto';

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 提高清晰度
        backgroundColor: format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
        logging: false,
        windowWidth: 720, // 设置更大的宽度以确保质量
        windowHeight: 960,
        useCORS: true, // 允许跨域图片
        onclone: clonedDoc => {
          // 在克隆的文档中也应用相同的样式
          const clonedElement = clonedDoc.querySelector('[data-card]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.overflow = 'visible';
            (clonedElement as HTMLElement).style.height = 'auto';
          }
        },
      });

      // 恢复原始滚动样式
      cardRef.current.style.overflow = originalStyle;
      cardRef.current.style.height = '480px';

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `小红书卡片_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 1.0);
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 辅助函数：获取字体样式
  const getFontStyle = (font: string) => {
    // 中文字体名称映射
    const fontMap: Record<string, string> = {
      '思源黑体': '"Source Han Sans SC", "Noto Sans SC", sans-serif',
      '思源宋体': '"Source Han Serif SC", "Noto Serif SC", serif',
      '霞鹜文楷': '"LXGW WenKai", serif',
      '楷体': 'KaiTi, STKaiti, serif',
      '宋体': 'SimSun, serif',
      '黑体': 'SimHei, sans-serif',
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
      <div className="p-6">
        <h1
          className="text-xl font-medium mb-6 text-center tracking-tight"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: parseInt(editorState.fontSize) + 2 + 'px',
          }}>
          {editorState.title || '什么是提示工程'}
        </h1>
        <div className="space-y-4">
          {editorState.sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-xl p-4 transition-all duration-200"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-0.5 h-4 bg-red-500 rounded-full"></div>
                <h2
                  className="text-base font-medium tracking-tight"
                  style={{
                    fontFamily: getFontStyle(editorState.font).fontFamily,
                    fontSize: editorState.fontSize,
                  }}>
                  {section.title || `小节 ${index + 1}`}
                </h2>
              </div>
              <p
                className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed pl-2.5"
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
      <div className="p-6 h-full">
        <h1
          className="text-lg font-bold mb-6"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: parseInt(editorState.fontSize) + 2 + 'px',
          }}>
          {editorState.title || '个人思考'}
        </h1>
        <div
          className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: editorState.fontSize,
          }}>
          <div className="text-gray-700 whitespace-pre-wrap" style={{ lineHeight: '1.8' }}>
            {editorState.sections[0]?.content || '输入内容...'}
          </div>
        </div>
      </div>
    </div>
  );

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
            3分钟快速生成精美图文内容，一键导出分享 | 提升创作效率的必备工具
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
                        onChange={e => setEditorState(prev => ({ ...prev, font: e.target.value }))}
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
                        onChange={e => setEditorState(prev => ({ ...prev, fontSize: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all">
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">背景色</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { color: '#E6F7F3', name: '清新绿' },
                        { color: '#F3E6FF', name: '淡紫色' },
                        { color: '#FFF3E6', name: '暖橙色' },
                        { color: '#E6F0FF', name: '天蓝色' },
                        { color: '#FFE6E6', name: '浅粉色' },
                        { color: '#F5F5F5', name: '浅灰色' },
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          className={`group relative w-6 h-6 rounded-full transition-all duration-300 ${
                            editorState.backgroundColor === color
                              ? 'ring-2 ring-offset-1 ring-blue-500/30 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditorState(prev => ({ ...prev, backgroundColor: color }))}>
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">标题</label>
                    <input
                      type="text"
                      value={editorState.title}
                      onChange={e => setEditorState(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入标题"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {editorState.template === 'knowledge' ? (
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
                            placeholder="输入内容"
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
                  ) : (
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
                        placeholder="输入你的思考内容..."
                        className="w-full px-3 py-2 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[300px] resize-none"
                        style={{
                          fontFamily: editorState.font,
                          fontSize: editorState.fontSize,
                          lineHeight: '1.8',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧预览区 - 保持不变 */}
            <div className="w-[380px] flex-shrink-0">
              <div className="flex flex-col items-start space-y-3">
                <div className="relative group">
                  {editorState.template === 'knowledge' ? <KnowledgeCard /> : <ThinkingCard />}
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
