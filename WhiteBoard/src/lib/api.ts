import { getCurrentUser } from "./supabase";
import { WindowItem } from "./types";

export type Platform = 'youtube' | 'tiktok' | 'instagram';

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== 'undefined') return 'http://localhost:3000';
  return 'http://backend:3000';
};


export async function createChat(chatName: string) {
  const whiteboard = await getCurrentWhiteboardId()
  const chat= {
    chat_name: chatName,
    whiteboardId: whiteboard.data.id
  }
  const res = await fetch(`${getBaseUrl()}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chat),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();
}

export async function deleteChat(chatId: string) {
  
  const response = await fetch(`${getBaseUrl()}/api/v1/chat/${chatId}`, {
    method: 'DELETE',
  });
  
  
  if (!response.ok) {
    const errorText = await response.text();
    
    // If chat not found (404), this is not a critical error
    if (response.status === 404) {
      throw new Error('Chat not found');
    }
    
    console.error('Delete chat failed with status:', response.status, 'Error:', errorText);
    throw new Error(`Failed to delete chat: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export async function sendMessage(chatId: string, message: string) {
  const res = await fetch(`${getBaseUrl()}/api/v1/chat/send-message/${chatId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getChatHistory(chatId: string) {
  const res = await fetch(`${getBaseUrl()}/api/v1/chat/${chatId}/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }); 
  
  if (!res.ok) {
    if (res.status === 404 || res.status === 500) {
      // Chat not found or deleted - this is normal for old/orphaned chats
      throw new Error('Chat not found');
    }
    throw new Error('Failed to get chat history');
  }
  
  return res.json();
}

export async function clearChatHistory(chatId: string) {
  const res = await fetch(`${getBaseUrl()}/api/v1/chat/${chatId}/history`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return res.json();
}

export async function deleteChatMessage(messageId: string) {
  const res = await fetch(`${getBaseUrl()}/api/v1/chat/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to delete message');
  return res.json();
}

export async function updateChatMessage(messageId: string, content: string) {
  const res = await fetch(`${getBaseUrl()}/api/v1/chat/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update message');
  return res.json();
}

export async function getStautsOfVideo(videoId: string): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/api/v1/status/video/${videoId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) throw new Error('Failed to get video status');

  return data.status;
}


export async function deleteVideo(id:string){

    const res = await fetch(`${getBaseUrl()}/api/v1/video/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
}

export async function getCurrentWhiteboardId(){
  const currentUser = await getCurrentUser()
    const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard/user/${encodeURIComponent(currentUser?.email as any)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return await response.json()
}

export async function getWhiteboard() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
      throw new Error('User not authenticated');
  }
  
  try {
      const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard/user/${encodeURIComponent(currentUser?.email as any)}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (response.ok) {
            const data = await response.json();
        
            if (data && data.data) {
                return data.data; 
            }
      }

      // If no whiteboard exists, create a new one
      const newWhiteboard = await fetch(`${getBaseUrl()}/api/v1/whiteboard/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              userId: currentUser.email, 
              title: 'My Whiteboard' 
          }),
      });
      return newWhiteboard.json()
  } catch (error) {
      console.error('Error in getWhiteboard:', error);
      throw error;
  }
}

export async function saveWhiteboardState(items: any[], whiteboardId?: string) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
      throw new Error('User not authenticated');
  }

  // Extract connections from items
  const allConnections = items.flatMap(item => item.connections || []);

  try {
      const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard/${whiteboardId }/save-state`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              whiteboardId: whiteboardId || currentUser.id,
              items: items,
          }),
      });

      if (!response.ok) {
          throw new Error(`Failed to save whiteboard state: ${response.statusText}`);
      }

      return response.json();
  } catch (error) {
      console.error('Error saving whiteboard state:', error);
      throw error;
  }
}

export async function createConnection(
  fromId: string,
  fromType: string,
  toId: string,
  toType: string,
  connectionType: string = 'association',
  label?: string,
  description?: string
) {
  try {
      // Validate input parameters
      if (!fromId || !toId) {
          throw new Error('fromId and toId are required');
      }
      
      if (!fromType || !toType) {
          console.warn('Missing types, using defaults:', { fromType, toType });
      }
      
      const response = await fetch(`${getBaseUrl()}/api/v1/connections/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              fromId,
              fromType: fromType || 'unknown',
              toId,
              toType: toType || 'unknown',
              connectionType,
              label,
              description
          }),
      });

      const result = await response.json();

      // Handle different response scenarios gracefully
      if (response.ok) {
          return result;
      }

      // Handle specific error cases
      if (response.status === 200 && result.success && result.message?.includes('already exists')) {
          // Connection already exists - this is not an error
          console.log('Connection already exists:', result.message);
          return result;
      }

      if (response.status === 404) {
          console.warn('Items not found for connection:', result.message);
          return { success: false, message: result.message };
      }

      if (response.status === 400) {
          console.warn('Invalid connection request:', result.message);
          return { success: false, message: result.message };
      }

      // For other errors, throw
      throw new Error(`Failed to create connection: ${result.message || response.statusText}`);

  } catch (error) {
      console.error('Error creating connection:', error);
      
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error creating connection - connection may still be created');
          return { success: false, message: 'Network error - please check your connection' };
      }
      
      throw error;
  }
}

export async function deleteConnection(connectionId: string) {
  try {
      const response = await fetch(`${getBaseUrl()}/api/v1/connections/${connectionId}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`Failed to delete connection: ${response.statusText}`);
      }

      return response.json();
  } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
  }
}

export async function updateConnection(connectionId: string, updateData: any) {
  try {
      const response = await fetch(`${getBaseUrl()}/api/v1/connections/${connectionId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
      });

      if (!response.ok) {
          throw new Error(`Failed to update connection: ${response.statusText}`);
      }

      return response.json();
  } catch (error) {
      console.error('Error updating connection:', error);
      throw error;
  }
}

export async function getConnectionsForItem(itemId: string, type?: string) {
  try {
      const queryParams = type ? `?type=${encodeURIComponent(type)}` : '';
      const response = await fetch(`${getBaseUrl()}/api/v1/connections/item/${itemId}${queryParams}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`Failed to get connections: ${response.statusText}`);
      }

      return response.json();
  } catch (error) {
      console.error('Error getting connections for item:', error);
      throw error;
  }
}

export async function updateWhiteboardItem(item: WindowItem) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
      throw new Error('User not authenticated');
  }
  const data ={
    item,
    userEmail: currentUser.email,
  }
  
  try {
    const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard-item/${item.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update item: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error updating item:', error);
    throw error;
  }
}

export async function createWhiteboardItem(item: WindowItem) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
      throw new Error('User not authenticated');
  }
  
  const whiteboardId = await getCurrentWhiteboardId();

  const data ={
    item,
    userEmail: currentUser.email,
  }
  data.item.whiteboardId = whiteboardId.data.id


  const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard-item/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  });
  const res= response.json()
  
  if (!response.ok) {
      throw new Error('Failed to create item');
  }
  
  return res;
}

export async function deleteWhiteboardItem(id: string) {
  
  const response = await fetch(`${getBaseUrl()}/api/v1/whiteboard-item/${id}`, {
      method: 'DELETE',
  });
    
  if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed with status:', response.status, 'Error:', errorText);
      throw new Error(`Failed to delete item: ${response.status} ${errorText}`);
  }
  
  if (response.status === 204) {
      return { success: true };
  }
  
  return response.json();
}


export async function createUser(email:string){
  const user = await fetch(`${getBaseUrl()}/api/v1/users/`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({email:email})

  })

  return user.json()
}