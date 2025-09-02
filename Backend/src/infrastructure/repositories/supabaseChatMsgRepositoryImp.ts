import { ChatMessage } from '../../domain/entities/chatMsg.entity';
import { IChatMessageRepository } from '../../domain/repositories/IChatMsgRepository';
import { supabase } from '../database/supabase_client';

export class ChatMessageRepository implements IChatMessageRepository {


    constructor() {
        
    }

    async save(chatMessage: ChatMessage): Promise<ChatMessage> {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert(chatMessage.toDatabase())
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save chat message: ${error.message}`);
        }

        return ChatMessage.fromDatabase(data);
    }

    async findById(id: string): Promise<ChatMessage | null> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { 
                return null;
            }
            throw new Error(`Failed to find chat message: ${error.message}`);
        }

        return ChatMessage.fromDatabase(data);
    }

    async findByChatId(chatId: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Failed to find chat messages: ${error.message}`);
        }

        return data.map(row => ChatMessage.fromDatabase(row));
    }

    async findRecent(limit: number): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Failed to find recent chat messages: ${error.message}`);
        }

        return data.map(row => ChatMessage.fromDatabase(row));
    }

    async deleteById(id: string): Promise<void> {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete chat message: ${error.message}`);
        }
    }

    async deleteByChatId(chatId: string): Promise<void> {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('chat_id', chatId);

        if (error) {
            throw new Error(`Failed to delete chat messages: ${error.message}`);
        }
    }

    async update(chatMessage: ChatMessage): Promise<ChatMessage> {
        chatMessage.updatedAt = new Date();
        
        const { data, error } = await supabase
            .from('chat_messages')
            .update(chatMessage.toDatabase())
            .eq('id', chatMessage.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update chat message: ${error.message}`);
        }

        return ChatMessage.fromDatabase(data);
    }
}