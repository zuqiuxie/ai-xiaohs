import { NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';

// Initialize the Unsplash API client
// Note: You'll need to add your Unsplash access key to your environment variables
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const result = await unsplash.search.getPhotos({
      query: keyword,
      perPage: 1,
      orientation: 'portrait', // 图片方向，landscape 横屏，portrait 竖屏，squarish 方图
    });

    if (result.errors) {
      return NextResponse.json({ error: result.errors[0] }, { status: 500 });
    }

    const photo = result.response?.results[0];
    if (!photo) {
      return NextResponse.json({ error: 'No image found' }, { status: 404 });
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
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
