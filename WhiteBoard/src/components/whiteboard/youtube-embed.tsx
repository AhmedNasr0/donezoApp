import * as React from 'react';

interface YoutubeEmbedProps {
  url: string;
}

export function YoutubeEmbed({ url }: YoutubeEmbedProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      if (hostname === 'youtu.be') {
        const videoId = pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
        if (pathname.startsWith('/embed/')) {
          return url;
        }
        if (pathname.startsWith('/watch')) {
          const videoId = searchParams.get('v');
          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        if (pathname.startsWith('/playlist')) {
          const listId = searchParams.get('list');
          if (listId) return `https://www.youtube.com/embed/videoseries?list=${listId}`;
        }
        if (pathname.startsWith('/channel/')) {
            const channelId = pathname.split('/')[2];
            // YouTube uses a convention where replacing 'UC' with 'UU' in a channel ID gives the uploads playlist ID.
            if (channelId && channelId.startsWith('UC')) {
              const uploadsListId = 'UU' + channelId.substring(2);
              return `https://www.youtube.com/embed/videoseries?list=${uploadsListId}`;
            }
        }
         // Fallback for /c/ and /user/ custom URLs. This is not 100% reliable without an API call,
         // but we will redirect to a search query for the user which is better than an error.
         if (pathname.startsWith('/user/') || pathname.startsWith('/c/')) {
           const customUrlName = pathname.split('/')[2];
           if(customUrlName) return `https://www.youtube.com/embed/videoseries?list=${customUrlName}`;
        }
      }
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return <div className="p-4 text-destructive">Invalid or unsupported YouTube URL</div>;
  }

  return (
    <iframe
      className="h-full w-full"
      src={embedUrl}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}
