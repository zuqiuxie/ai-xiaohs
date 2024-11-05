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
    font: '楷体',
    fontSize: '16px',
    backgroundColor: '#E6F7F3',
    sections: [{ ...defaultSection }],
  });

  const cardRef = useRef<HTMLDivElement>(null);

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
        onclone: (clonedDoc) => {
          // 在克隆的文档中也应用相同的样式
          const clonedElement = clonedDoc.querySelector('[data-card]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.overflow = 'visible';
            (clonedElement as HTMLElement).style.height = 'auto';
          }
        }
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
      '楷体': 'KaiTi, 楷体, STKaiti',
      '宋体': 'SimSun, 宋体',
      '黑体': 'SimHei, 黑体'
    };

    return {
      fontFamily: fontMap[font] || font
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
            fontSize: parseInt(editorState.fontSize) + 2 + 'px'
          }}
        >
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
                    fontSize: editorState.fontSize
                  }}
                >
                  {section.title || `小节 ${index + 1}`}
                </h2>
              </div>
              <p
                className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed pl-2.5"
                style={{
                  fontFamily: getFontStyle(editorState.font).fontFamily,
                  fontSize: editorState.fontSize
                }}
              >
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
      <div className="p-6">
        <h1
          className="text-lg font-bold mb-6"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: parseInt(editorState.fontSize) + 2 + 'px'
          }}
        >
          {editorState.title || '个人思考'}
        </h1>
        <div
          className="text-gray-700 whitespace-pre-wrap"
          style={{
            fontFamily: getFontStyle(editorState.font).fontFamily,
            fontSize: editorState.fontSize,
            lineHeight: '1.8'
          }}
        >
          {editorState.sections[0]?.content || '输入内容...'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#F5F5F7] overflow-hidden">
      <div className="h-full max-w-[1200px] mx-auto p-4">
        <div className="flex gap-8 h-full">
          {/* 左侧编辑区 */}
          <div className="w-[480px] overflow-y-auto pr-4 space-y-4">
            {/* 模板选择 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
              <div className="inline-flex p-1 gap-1 bg-gray-100 rounded-lg">
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    editorState.template === 'knowledge'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTemplateChange('knowledge')}>
                  知识干货模板
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    editorState.template === 'thinking'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTemplateChange('thinking')}>
                  个人思考模板
                </button>
              </div>
            </div>

            {/* 样式设置 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">样式设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">字体</span>
                      <select
                        value={editorState.font}
                        onChange={e => setEditorState(prev => ({ ...prev, font: e.target.value }))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <option value="楷体">楷体</option>
                        <option value="宋体">宋体</option>
                        <option value="黑体">黑体</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">字号</span>
                      <select
                        value={editorState.fontSize}
                        onChange={e => setEditorState(prev => ({ ...prev, fontSize: e.target.value }))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">背景</span>
                    <div className="flex gap-2">
                      {[
                        '#E6F7F3', // 清新绿
                        '#F3E6FF', // 淡紫色
                        '#FFF3E6', // 暖橙色
                        '#E6F0FF', // 天蓝色
                        '#FFE6E6', // 浅粉色
                        '#F5F5F5', // 浅灰色
                      ].map(color => (
                        <button
                          key={color}
                          className={`w-7 h-7 rounded-full transition-all duration-200 ${
                            editorState.backgroundColor === color
                              ? 'ring-2 ring-offset-2 ring-blue-500/30'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditorState(prev => ({ ...prev, backgroundColor: color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 内容编辑 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">内容编辑</h3>
                <input
                  type="text"
                  value={editorState.title}
                  onChange={e => setEditorState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入标题"
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-base"
                />

                <div className="space-y-3 mt-3">
                  {editorState.template === 'knowledge' ? (
                    editorState.sections.map((section, index) => (
                      <div key={section.id} className="space-y-2 bg-gray-50/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={e => {
                              const newSections = [...editorState.sections];
                              newSections[index].title = e.target.value;
                              setEditorState(prev => ({ ...prev, sections: newSections }));
                            }}
                            placeholder={`小节标题 ${index + 1}`}
                            className="flex-1 px-2 py-1.5 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                          />
                          {editorState.sections.length > 1 && (
                            <button
                              onClick={() => handleRemoveSection(section.id)}
                              className="text-sm text-red-500 hover:text-red-600 transition-colors">
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
                          placeholder={editorState.template === 'knowledge' ? '输入内容' : `思考点 ${index + 1}`}
                          className="w-full px-2 py-1.5 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[60px] resize-none"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2 bg-gray-50/50 rounded-lg p-3">
                      <textarea
                        value={editorState.sections[0]?.content || ''}
                        onChange={(e) => {
                          const newSections = [{
                            ...defaultSection,
                            id: editorState.sections[0]?.id || uuidv4(),
                            content: e.target.value
                          }];
                          setEditorState(prev => ({ ...prev, sections: newSections }));
                        }}
                        placeholder="输入你的思考内容..."
                        className="w-full px-3 py-2 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[300px] resize-none"
                        style={{
                          fontFamily: editorState.font,
                          fontSize: editorState.fontSize,
                          lineHeight: '1.8'
                        }}
                      />
                    </div>
                  )}
                </div>

                {editorState.template === 'knowledge' && editorState.sections.length < 5 && (
                  <button
                    onClick={handleAddSection}
                    className="mt-3 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                    添加小节
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div className="flex-1">
            <div className="sticky top-8 flex flex-col items-center gap-4">
              {/* 预览卡片 */}
              <div className="flex justify-center">
                {editorState.template === 'knowledge' ? <KnowledgeCard /> : <ThinkingCard />}
              </div>

              {/* 下载按钮 */}
              <div className="w-[360px]">
                {' '}
                {/* 与卡片等宽 */}
                <button
                  onClick={() => handleDownload('png')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
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
