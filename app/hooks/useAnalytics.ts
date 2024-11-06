import { useCallback } from 'react';
import { track } from '@vercel/analytics';

type EventName =
  | 'generate_content'    // AI生成内容
  | 'download_image'      // 下载图片
  | 'change_template'     // 切换模板
  | 'change_style'        // 修改样式
  | 'page_view';          // 页面访问

// 定义允许的属性值类型
type AllowedPropertyValue = string | number | boolean | null;

// 修改 EventProperties 接口以匹配 Vercel Analytics 的要求
interface EventProperties {
  [key: string]: AllowedPropertyValue;
}

export function useAnalytics() {
  const trackEvent = useCallback((
    eventName: EventName,
    properties?: EventProperties
  ) => {
    try {
      // 过滤掉 undefined 值
      const cleanProperties = properties ?
        Object.fromEntries(
          Object.entries(properties).filter(([_, value]) => value !== undefined)
        ) as Record<string, AllowedPropertyValue> :
        undefined;

      track(eventName, cleanProperties);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  return {
    trackEvent,
  };
}