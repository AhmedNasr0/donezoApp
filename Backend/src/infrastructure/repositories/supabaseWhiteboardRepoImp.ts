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

        const allRelatedConnections:any[] = items.flatMap(item => item.connections);

        // remove dublicated Id
        const uniqueConnections: any[] = Array.from(
            new Map(allRelatedConnections.map(conn => [conn.id, conn])).values()
            ).map(rawConn => ({
            id: rawConn.id,
            whiteboard_id: whiteboardId,
            from_id: rawConn.fromId ?? rawConn.from,
            to_id: rawConn.toId ?? rawConn.to,
            from_type: rawConn.fromType ?? items.find(i => i.id === rawConn.from)?.type,
            to_type: rawConn.toType ?? items.find(i => i.id === rawConn.to)?.type,
            connection_type: rawConn.type ?? rawConn.connectionType ?? 'association',
            label: rawConn.label ?? null,
            description: rawConn.description ?? null,
            style: rawConn.style ?? null,
            bidirectional: rawConn.bidirectional ?? false,
            strength: rawConn.strength ?? 3,
            metadata: rawConn.metadata ?? null,
            created_timestamp: Date.now(),
            updated_timestamp: Date.now()
            }));

            if (uniqueConnections.length > 0) {
                try {
                    const { error: connectionsError } = await supabase
                        .from('connections')
                        .upsert(uniqueConnections, { 
                            onConflict: 'id',
                        });
    
                    if (connectionsError) {
                        console.warn('Warning: Some connections could not be saved:', connectionsError);
                    }
                } catch (error) {
                    console.error('Error saving connections:', error);
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