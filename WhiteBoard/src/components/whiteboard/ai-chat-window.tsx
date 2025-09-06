'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CustomScrollArea } from '@/components/ui/CustomScrollArea'; 
import { useToast } from '@/hooks/use-toast';
import { Bot, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { WindowItem } from '@/lib/types';
import { clearChatHistory, deleteChatMessage, getChatHistory, sendMessage } from '@/lib/api';

type Message = {
  id: string;
  role: 'user' | 'ai' | 'assistant';
  content: string;
  context?: string[];
  createdAt: Date;
};

interface AiChatWindowProps {
    item: WindowItem;
    items: WindowItem[];
}

export function AiChatWindow({ item, items }: AiChatWindowProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const { toast } = useToast();
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  React.useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        
        // Add a small delay to allow chat creation to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await getChatHistory(item.id);
        
        if (response.success && response.data.messages) {
          const loadedMessages: Message[] = response.data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            context: msg.context || [],
            createdAt: new Date(msg.createdAt)
          }));
          
          setMessages(loadedMessages);
          
          if (loadedMessages.length > 0) {
            toast({
              description: `Loaded ${loadedMessages.length} previous messages`,
            });
          }
        }
      } catch (error: any) {
        // If chat not found, it means the chat was deleted or not yet created - this is normal
        if (error.message?.includes('Chat not found') || error.message?.includes('Failed to get chat history')) {
          setMessages([]);
        } else {
          console.error('Error loading chat history:', error);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (item.id) {
      loadChatHistory();
    }
  }, [item.id, toast]);

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    const autoScrollToBottom = () => {
      if (scrollViewportRef.current) {
        const viewport = scrollViewportRef.current;
        viewport.scrollTop = viewport.scrollHeight;
      }
    };

    // Use a small delay to ensure content is rendered
    const timeoutId = setTimeout(autoScrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Check if user is at bottom of chat
  const checkIfAtBottom = React.useCallback(() => {
    if (!scrollViewportRef.current) return;
    
    const viewport = scrollViewportRef.current;
    const isAtBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 10;
    setShowScrollButton(!isAtBottom && messages.length > 0);
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = React.useCallback(() => {
    if (scrollViewportRef.current) {
      const viewport = scrollViewportRef.current;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Add scroll event listener
  React.useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      checkIfAtBottom();
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // Check if at bottom when messages change
  React.useEffect(() => {
    checkIfAtBottom();
  }, [messages, checkIfAtBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
  
    const currentInput = input.trim();
    setInput(''); 
    setIsLoading(true);
  
    const userMsg: Message = { 
      id: Date.now().toString() + '_user', 
      role: 'user', 
      content: currentInput,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
  
    try {
      const response = await sendMessage(item.id, currentInput);
      
      if (!response.ok && response.data.answer === "no Answer") {
        toast({
          variant: 'destructive',
          title: 'No context available',
          description: 'Please wait until resources are transcribed or connect some content to this chat.',
        });
        
        const aiMsg: Message = { 
          id: Date.now().toString() + '_ai', 
          role: 'assistant', 
          content: "Please wait until resources transcript is ready or connect some content to this chat.",
          createdAt: new Date()
        };
        
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
  
      try {
        // Add a small delay to ensure chat is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const historyResponse = await getChatHistory(item.id);
        if (historyResponse.success && historyResponse.data.messages) {
          const loadedMessages: Message[] = historyResponse.data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            context: msg.context || [],
            createdAt: new Date(msg.createdAt)
          }));
          
          setMessages(loadedMessages);
        }
      } catch (historyError: any) {
        // If chat not found, continue with current messages
        if (historyError.message?.includes('Chat not found')) {
        } else {
          console.error('Error loading chat history after sending message:', historyError);
        }
      }
  
    } catch (error) {
        console.error('Error generating response:', error);
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: 'Failed to get a response from the AI. Please try again.',
        });
        
        const errorMsg: Message = { 
          id: Date.now().toString() + '_error', 
          role: 'assistant', 
          content: "Sorry, I couldn't process that request. Please try again.",
          createdAt: new Date()
        };
        
        setMessages((prev) => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory(item.id);
      setMessages([]);
      toast({
        description: 'Chat history cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to clear history',
        description: 'Could not clear chat history. Please try again.',
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        description: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete message',
        description: 'Could not delete message. Please try again.',
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden relative">
      <CustomScrollArea className="flex-1 min-h-0" viewportRef={scrollViewportRef}>
        <div className="p-4 space-y-4 min-h-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 gap-4">
              <MessageCircle className="h-10 w-10" />
              <p>Start a conversation with the AI assistant.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 items-start ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <pre className="whitespace-pre-wrap font-body">{message.content}</pre>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-3 items-start">
              <Bot className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CustomScrollArea>
        
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-16 right-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={scrollToBottom}
            title="Scroll to newest message"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
        
      <div className="border-t bg-background p-2 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}