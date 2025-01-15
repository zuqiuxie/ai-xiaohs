# 多语言支持技术方案

## 1. 技术选型

- **框架**: next-intl（与 Next.js 深度集成）
- **路由**: 基于 App Router 的国际化路由
- **存储**: JSON 格式的语言文件

## 2. 目录结构

```
app/
├── [locale]/ # 动态语言路由
│ └── layout.tsx # 语言相关布局
├── components/ # 组件保持不变
├── messages/ # 翻译文件
│ ├── zh/
│ │ ├── common.json # 公共文案
│ │ ├── editor.json # 编辑器相关
│ │ └── validation.json # 验证信息
│ └── en/
│ └── ...
└── middleware.ts # 语言检测和路由中间件
```

## 3. 核心改造点

### 3.1 路由层

- 实现语言检测和路由重定向
- 默认语言：中文
- URL 格式：`/{locale}/路径`

### 3.2 组件层

- 使用 hooks 获取翻译文本
- 组件保持纯展示逻辑
- 所有文案通过 props 传入

### 3.3 内容层

- 静态内容：通过翻译文件管理
- 动态内容：支持变量插值
- 验证信息：统一管理错误提示

## 4. SEO 考虑

- 动态生成多语言元数据
- 自动设置语言标签
- 维护正确的 hreflang 标签

## 5. 实施步骤

### 5.1 基础设施搭建

1. 安装依赖

```bash
npm install next-intl
```

2. 配置中间件

```tsx
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './config/i18n';
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
```

### 5.2 路由改造

1. 创建语言配置

```tsx
// config/i18n.ts
export const locales = ['zh', 'en'] as const;
export const defaultLocale = 'zh' as const;
```

2. 实现语言切换组件

### 5.3 组件国际化

1. 改造现有组件
2. 提取所有硬编码文案
3. 使用翻译 hooks

### 5.4 内容迁移

1. 创建语言文件
2. 迁移静态文案
3. 处理动态内容

### 5.5 测试和优化

1. 功能测试
2. SEO 检查
3. 性能优化

## 6. 注意事项

- 确保所有静态文本都使用翻译 key
- 考虑数字、日期、货币等本地化
- 注意翻译文本的动态插值
- 考虑 SEO 影响
