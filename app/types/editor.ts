export type TemplateType = 'ai' | 'hot_post';

export interface Section {
  id: string
  title: string
  content: string
}

export interface EditorState {
  template: TemplateType
  title: string
  font: string
  fontSize: string
  backgroundColor: string
  sections: Section[]
}