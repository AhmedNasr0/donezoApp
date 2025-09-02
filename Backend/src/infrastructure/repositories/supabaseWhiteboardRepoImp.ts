import { Connection } from "../../domain/entities/connection.entity";
import { Whiteboard } from "../../domain/entities/whiteboard.entity";
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

    async saveWhiteboardWithConnections(whiteboardId: string, items: any[], connections: any[]): Promise<Whiteboard> {
        // delete old connections
        await supabase.from('connections').delete().eq('whiteboard_id', whiteboardId);

        // insert new connections
        if (connections.length > 0) {
            const connectionObjects = connections.map(conn =>
                Connection.fromFrontendConnection(conn, conn.fromType || 'unknown', conn.toType || 'unknown')
            );

            for (const conn of connectionObjects) {
                await this.connectionRepository.createConnection(conn);
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