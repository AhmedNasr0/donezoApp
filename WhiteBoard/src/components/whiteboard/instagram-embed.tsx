'use client';

import * as React from 'react';

interface InstagramEmbedProps {
  url: string;
}

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  const [embedUrl, setEmbedUrl] = React.useState<string>('');

  React.useEffect(() => {
    // Convert Instagram URL to embed URL
    if (url.includes('/reel/') || url.includes('/reels/')) {
      // For Instagram Reels (both /reel/ and /reels/ formats)
      const reelId = url.match(/\/(?:reel|reels)\/([^\/\?]+)/)?.[1];
      if (reelId) {
        setEmbedUrl(`https://www.instagram.com/p/${reelId}/embed/`);
      }
    } else if (url.includes('/p/')) {
      // For Instagram Posts
      const postId = url.match(/\/p\/([^\/\?]+)/)?.[1];
      if (postId) {
        setEmbedUrl(`https://www.instagram.com/p/${postId}/embed/`);
      }
    } else if (url.includes('/tv/')) {
      // For Instagram TV
      const tvId = url.match(/\/tv\/([^\/\?]+)/)?.[1];
      if (tvId) {
        setEmbedUrl(`https://www.instagram.com/p/${tvId}/embed/`);
      }
    } else {
      // For Instagram profiles, show a placeholder
      setEmbedUrl('');
    }
  }, [url]);

  if (!embedUrl) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center p-4">
          <div className="text-2xl mb-2">📷</div>
          <p className="text-sm text-muted-foreground">Instagram Profile</p>
          <p className="text-xs text-muted-foreground mt-1">Profile links are not embeddable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={embedUrl}
        className="h-full w-full border-0 rounded-lg"
        title="Instagram Embed"
        allowTransparency={true}
        frameBorder="0"
        scrolling="no"
        allow="encrypted-media"
      />
    </div>
  );
}
