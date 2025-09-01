export type Platform = 'youtube' | 'tiktok' | 'instagram';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== 'undefined') return 'http://localhost:3000';
  return 'http://backend:3000';
};

console.log("Backend URL is :",getBaseUrl())
export async function uploadVideoLink(url: string, platform: Platform, title?: string) : Promise<any> {
  const res = await fetch(`${getBaseUrl()}/api/v1/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, platform, title }),
  });
  if (!res.ok) throw new Error('Failed to upload video');
  return res.json();
}
export async function createChat(chatName:string){
  const res = await fetch(`${getBaseUrl()}/api/v1/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_name:chatName }),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();

}

export async function createConnection(fromId:string,fromType:string,toId:string,toType:string){
  const res = await fetch(`${getBaseUrl()}/api/v1/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId:fromId,fromType:fromType,toId:toId,toType:toType }),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();
}

export async function deleteConnection(connectionId:string){
  const res = await fetch(`${getBaseUrl()}/api/v1/connections/${connectionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to delete chat');
  return res.json();
}

export async function getStautsOfVideo(videoId: string): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/api/v1/status/video/${videoId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  console.log(`Video with ID ${videoId} Status :`, data);

  if (!res.ok) throw new Error('Failed to get video status');

  return data.status;
}


export async function sendMessage(chatId:string,message:string){
  const res = await fetch(`${getBaseUrl()}/api/v1/chats/send-message/${chatId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({question:message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function deleteVideo(id:string){

    const res = await fetch(`${getBaseUrl()}/api/v1/video/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("Item Deleted",res.json())
    if (!res.ok) throw new Error('Failed to delete video');
    console.log(res)
    return res.json();
}
