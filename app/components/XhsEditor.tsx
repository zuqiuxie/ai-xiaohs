'use client'

import { useState, useRef } from 'react'
import { EditorState, Section, TemplateType } from '../types/editor'
import { v4 as uuidv4 } from 'uuid'
import html2canvas from 'html2canvas'

const defaultSection: Section = {
  id: uuidv4(),
  title: '',
  content: ''
}

const XhsEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    template: 'knowledge',
    title: '',
    font: '楷体',
    fontSize: '16px',
    backgroundColor: '#E6F7F3',
    sections: [{ ...defaultSection }]
  })

  const cardRef = useRef<HTMLDivElement>(null)

  const handleTemplateChange = (template: TemplateType) => {
    setEditorState(prev => ({
      ...prev,
      template,
      sections: [{ ...defaultSection }]
    }))
  }

  const handleAddSection = () => {
    setEditorState(prev => ({
      ...prev,
      sections: [...prev.sections, { ...defaultSection, id: uuidv4() }]
    }))
  }

  const handleRemoveSection = (id: string) => {
    setEditorState(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }))
  }

  // 下载函数
  const handleDownload = async (format: 'png' | 'jpg' | 'jpeg') => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 提高清晰度
        backgroundColor: format === 'jpg' || format === 'jpeg' ? '#FFFFFF' : null,
        logging: false,
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `小红书卡片_${Date.now()}.${format}`
      link.href = canvas.toDataURL(`image/${format}`)
      link.click()
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  // 知识干货模板
  const KnowledgeCard = () => (
    <div ref={cardRef} className="w-[360px] h-[480px] mx-auto overflow-y-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm"
      style={{
        backgroundColor: editorState.backgroundColor,
        fontFamily: editorState.font,
        fontSize: editorState.fontSize
      }}>
      <div className="p-6">
        <h1 className="text-xl font-medium mb-6 text-center tracking-tight">
          {editorState.title || '什么是提示工程'}
        </h1>
        <div className="space-y-4">
          {editorState.sections.map((section, index) => (
            <div key={section.id}
              className="rounded-xl p-4 transition-all duration-200"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-0.5 h-4 bg-red-500 rounded-full"></div>
                <h2 className="text-base font-medium tracking-tight">
                  {section.title || `小节 ${index + 1}`}
                </h2>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed pl-2.5">
                {section.content || '内容描述...'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 个人思考模板
  const ThinkingCard = () => (
    <div ref={cardRef} className="w-[360px] h-[480px] mx-auto overflow-y-auto p-6 rounded-xl shadow-lg bg-white" style={{
      fontFamily: editorState.font,
      fontSize: editorState.fontSize
    }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <h1 className="text-lg font-bold">
          {editorState.title || '关于提示词的学习思考'}
        </h1>
      </div>
      <div className="space-y-4">
        {editorState.sections.map((section, index) => (
          <div key={section.id} className="bg-gray-50/80 rounded-lg p-4 text-sm text-gray-700">
            {section.content || `思考点 ${index + 1}...`}
          </div>
        ))}
      </div>
      <div className="mt-6 text-gray-500 text-xs">
        —— AI电商研习社
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#F5F5F7] overflow-hidden">
      <div className="h-full max-w-[1200px] mx-auto p-4">
        <div className="flex gap-8 h-full">
          {/* 左侧编辑区 - 添加滚动条 */}
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
                  onClick={() => handleTemplateChange('knowledge')}
                >
                  知识干货模板
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    editorState.template === 'thinking'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTemplateChange('thinking')}
                >
                  个人思考模板
                </button>
              </div>
            </div>

            {/* 样式设置 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">样式设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">字体</span>
                    <select
                      value={editorState.font}
                      onChange={(e) => setEditorState(prev => ({ ...prev, font: e.target.value }))}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="楷体">楷体</option>
                      <option value="宋体">宋体</option>
                      <option value="黑体">黑体</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">字号</span>
                    <select
                      value={editorState.fontSize}
                      onChange={(e) => setEditorState(prev => ({ ...prev, fontSize: e.target.value }))}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>

                  {editorState.template === 'knowledge' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16">背景</span>
                      <div className="flex-1 flex gap-2">
                        {['#FFE8E8', '#F3E6FF', '#E6F7F3', '#FFF3E6'].map(color => (
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
                  )}
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
                  onChange={(e) => setEditorState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入标题"
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-base"
                />

                <div className="space-y-3 mt-3">
                  {editorState.sections.map((section, index) => (
                    <div key={section.id} className="space-y-2 bg-gray-50/50 rounded-lg p-3">
                      {editorState.template === 'knowledge' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...editorState.sections]
                              newSections[index].title = e.target.value
                              setEditorState(prev => ({ ...prev, sections: newSections }))
                            }}
                            placeholder={`小节标题 ${index + 1}`}
                            className="flex-1 px-2 py-1.5 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                          />
                          {editorState.sections.length > 1 && (
                            <button
                              onClick={() => handleRemoveSection(section.id)}
                              className="text-sm text-red-500 hover:text-red-600 transition-colors"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      )}
                      <textarea
                        value={section.content}
                        onChange={(e) => {
                          const newSections = [...editorState.sections]
                          newSections[index].content = e.target.value
                          setEditorState(prev => ({ ...prev, sections: newSections }))
                        }}
                        placeholder={editorState.template === 'knowledge' ? "输入内容" : `思考点 ${index + 1}`}
                        className="w-full px-2 py-1.5 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[60px] resize-none"
                      />
                    </div>
                  ))}
                </div>

                {editorState.sections.length < (editorState.template === 'knowledge' ? 5 : 3) && (
                  <button
                    onClick={handleAddSection}
                    className="mt-3 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    添加{editorState.template === 'knowledge' ? '小节' : '思考点'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div className="flex-1">
            <div className="sticky top-8 space-y-4">
              {/* 下载按钮组 */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  下载 PNG
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  下载 JPG
                </button>
              </div>

              {/* 预览卡片 */}
              <div className="flex justify-center">
                {editorState.template === 'knowledge' ? <KnowledgeCard /> : <ThinkingCard />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default XhsEditor