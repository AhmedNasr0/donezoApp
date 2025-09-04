import { Connection } from "../../domain/entities/connection.entity";
import { Whiteboard } from "../../domain/entities/whiteboard.entity";
import { WhiteboardItem } from "../../domain/entities/whiteboardItem.entity";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { IWhiteboardRepository } from "../../domain/repositories/IWhiteboardRepository";
import { supabase } from "../database/supabase_client";

export class WhiteboardRepository implements IWhiteboardRepository {
    constructor(private connectionRepository: IConnectionRepository) {}

    async createWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard> {
        const { data, error } = await supabase
            .from('whiteboards')
            .insert([{ id: whiteboard.id, user_id: whiteboard.user_id, title: whiteboard.title }])
            .select()
            .single();

        if (error) throw error;
        return whiteboard;
    }

    async updateWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard> {
        const { error } = await supabase
            .from('whiteboards')
            .update({ title: whiteboard.title, updated_at: new Date().toISOString() })
            .eq('id', whiteboard.id);

        if (error) throw error;
        return whiteboard;
    }

    async getUserWhiteboard(userId: string): Promise<Whiteboard | null> {
        const { data, error } = await supabase
            .from('whiteboards')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();

        if (error) return null;
        return new Whiteboard(data.id, data.user_id, data.title, [], [], data.created_at, data.updated_at);
    }

    async getById(id: string): Promise<Whiteboard | null> {
        const { data, error } = await supabase
            .from('whiteboards')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return new Whiteboard(data.id, data.user_id, data.title, [], [], data.created_at, data.updated_at);
    }

    async deleteWhiteboard(id: string): Promise<void> {
        const { error } = await supabase.from('whiteboards').delete().eq('id', id);
        if (error) throw error;
    }

    async saveWhiteboardWithConnections(whiteboardId: string, items: WhiteboardItem[]): Promise<Whiteboard> {
        // delete old connections
        await supabase.from('connections').delete().eq('whiteboard_id', whiteboardId);


        const allRelatedConnections = items.flatMap(item => item.connections);

        // remove dublicated Id
        const uniqueConnections = Array.from(
        new Map(allRelatedConnections.map(conn => [conn.id, conn])).values()
        );



        // insert new connections
        if (uniqueConnections.length > 0) {
            for (const conn of uniqueConnections) {
                if (conn) {
                    await this.connectionRepository.createConnection(conn);
                }
            }
        }

        const whiteboard = await this.getById(whiteboardId);
        return whiteboard!;
    }

    async getWhiteboardWithConnections(whiteboardId: string): Promise<{ whiteboard: Whiteboard; connections: Connection[] } | null> {
        const whiteboard = await this.getById(whiteboardId);
        if (!whiteboard) return null;

        const connections = await this.connectionRepository.findConnectionsByWhiteboard(whiteboardId);
        return { whiteboard, connections };
    }
}