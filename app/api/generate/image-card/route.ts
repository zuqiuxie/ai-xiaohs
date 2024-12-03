import { NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';

// Initialize the Unsplash API client
// Note: You'll need to add your Unsplash access key to your environment variables
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

// 用于存储最近使用过的图片ID
let recentImageIds = new Set<string>();
const MAX_RECENT_IMAGES = 10; // 记录最近使用的10张图片

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const result = await unsplash.search.getPhotos({
      query: keyword,
      perPage: 5, // 获取5张图片
      orientation: 'portrait',
    });

    if (result.errors) {
      return NextResponse.json({ error: result.errors[0] }, { status: 500 });
    }

    const photos = result.response?.results;
    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: 'No image found' }, { status: 404 });
    }

    // 过滤掉最近使用过的图片
    const unusedPhotos = photos.filter(photo => !recentImageIds.has(photo.id));

    // 如果所有图片都用过了，就使用原始数组
    const availablePhotos = unusedPhotos.length > 0 ? unusedPhotos : photos;

    // 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * availablePhotos.length);
    const photo = availablePhotos[randomIndex];

    // 更新最近使用的图片记录
    recentImageIds.add(photo.id);
    // 如果记录的图片ID超过限制，删除最早的记录
    if (recentImageIds.size > MAX_RECENT_IMAGES) {
      const [firstId] = recentImageIds;
      recentImageIds.delete(firstId);
    }

    return NextResponse.json({
      url: photo.urls.regular,
      downloadUrl: photo.urls.full,
      author: {
        name: photo.user.name,
        username: photo.user.username,
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
