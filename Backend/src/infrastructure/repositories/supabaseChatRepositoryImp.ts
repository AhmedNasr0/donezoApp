import { Chat } from "../../domain/entities/chat.entity";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { supabase } from "../database/supabase_client";

export class ChatRepository implements IChatRepository {

    async getAllChats(): Promise<Chat[]> {
        const { data, error } = await supabase
            .from("chats")
            .select("*");

        if (error) throw error;

        return (data || []).map((row: any) => new Chat(
            row.id,
            row.chat_name,
            row.numOfConnections,
            new Date(row.created_at),
            (row.chat_messages || []).map((msg: any) => ({
                ...msg,
                createdAt: new Date(msg.createdAt),
                updatedAt: new Date(msg.updatedAt)
            })),
            row.whiteboard_id
        ));
    }

    async createChat(chat: Chat): Promise<Chat> {
        const { data, error } = await supabase
            .from("chats")
            .insert([{
                id: chat.id,
                chat_name: chat.chat_name,
                chat_messages: chat.chat_messages,
                numOfConnections: chat.numOfConnections,
                whiteboard_id: chat.whiteboardId ||null,
                created_at: chat.createdAt
            }])
            .select()
            .single();

        if (error) throw error;

        return new Chat(
            data.id,
            data.chat_name,
            data.numOfConnections,
            new Date(data.created_at),
            data.chat_messages || [],
            data.whiteboard_id
        );
    }

    async getChatById(id: string): Promise<Chat | null> {
        const { data, error } = await supabase
            .from("chats")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null; // not found
            throw error;
        }

        return new Chat(
            data.id,
            data.chat_name,
            data.numOfConnections,
            new Date(data.created_at),
            data.chat_messages || [],
            data.whiteboard_id
        );
    }

    async updateChat(chat: Chat): Promise<Chat> {
        const { data, error } = await supabase
            .from("chats")
            .update({
                chat_name: chat.chat_name,
                chat_messages: chat.chat_messages,
                numOfConnections: chat.numOfConnections,
                updated_at: new Date()
            })
            .eq("id", chat.id)
            .select()
            .single();

        if (error) throw error;

        return new Chat(
            data.id,
            data.chat_name,
            data.numOfConnections,
            new Date(data.created_at),
            data.chat_messages || [],
            data.whiteboard_id
        );
    }

    async deleteChat(id: string): Promise<void> {
        const { error } = await supabase
            .from("chats")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
}
