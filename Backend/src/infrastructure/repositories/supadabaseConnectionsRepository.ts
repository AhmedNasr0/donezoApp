import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { Connection } from '../../domain/entities/connection.entity';
import { supabase } from '../database/supabase_client';

export class ConnectionRepository implements IConnectionRepository {
    async createConnection(connection: Connection): Promise<Connection> {
        const { data, error } = await supabase
            .from('connections')
            .insert([
                {
                    id: connection.id,
                    from_id: connection.fromId,
                    from_type: connection.fromType,
                    to_id: connection.toId,
                    to_type: connection.toType,
                    connection_type: connection.type,
                    label: connection.label,
                    description: connection.description,
                    style: connection.style,
                    bidirectional: connection.bidirectional,
                    strength: connection.strength,
                    metadata: connection.metadata,
                    created_timestamp: connection.created,
                    updated_timestamp: connection.updated,
                    whiteboard_id: await this.getWhiteboardIdFromItem(connection.fromId)
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return this.mapRowToConnection(data);
    }

    async findConnectionsByID(id: string): Promise<Connection | null> {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapRowToConnection(data);
    }

    async findConnectionsByWhiteboard(whiteboardId: string): Promise<Connection[]> {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .eq('whiteboard_id', whiteboardId);

        if (error) throw error;
        return data.map(this.mapRowToConnection);
    }

    async updateConnection(connection: Connection): Promise<Connection> {
        const { data, error } = await supabase
            .from('connections')
            .update({
                connection_type: connection.type,
                label: connection.label,
                description: connection.description,
                style: connection.style,
                bidirectional: connection.bidirectional,
                strength: connection.strength,
                metadata: connection.metadata,
                updated_timestamp: Date.now()
            })
            .eq('id', connection.id)
            .select()
            .single();

        if (error) throw error;
        return this.mapRowToConnection(data);
    }

    async findAllConnections(): Promise<Connection[]> {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(this.mapRowToConnection);
    }

    async deleteConnection(id: string): Promise<void> {
        const { error } = await supabase.from('connections').delete().eq('id', id);
        if (error) throw error;
    }

    async findConnectionIdsForEntity(entityId: string, type?: string): Promise<string[]> {
        
        try {
            // Get ALL connections first to debug
            const { data: allConnections, error: allError } = await supabase
                .from('connections')
                .select('*');
            
            
            const { data, error } = await supabase
                .from('connections')
                .select('*')
                .or(`from_id.eq.${entityId},to_id.eq.${entityId}`);
            
            
            if (error) {
                console.error("Database error:", error);
                throw error;
            }
            
            if (!data || data.length === 0) {
                return [];
            }
            
            const connectedEntityIds = data.map(connection => {
                
                if (connection.from_id === entityId) {
                    return connection.to_id;
                } else {
                    return connection.from_id;
                }
            });
            
            return connectedEntityIds;
            
        } catch (error) {
            console.error("Error in findConnectionIdsForEntity:", error);
            throw error;
        }
    }

    async findConnectionsForEntity(entityId: string, type?: string): Promise<Connection[]> {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .or(`from_id.eq.${entityId},to_id.eq.${entityId}`);

        if (error) throw error;
        
        
        return (data || []).map(this.mapRowToConnection);
    }
    
    async connectionExists(fromID: string, toID: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .or(`and(from_id.eq.${fromID},to_id.eq.${toID}),and(from_id.eq.${toID},to_id.eq.${fromID})`);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

    async deleteConnectionsForItem(itemId: string): Promise<void> {
        const { error } = await supabase
            .from('connections')
            .delete()
            .or(`from_id.eq.${itemId},to_id.eq.${itemId}`);

        if (error) throw error;
    }

    async bulkCreateConnections(connections: Connection[]): Promise<Connection[]> {
        if (connections.length === 0) return [];
        const { data, error } = await supabase
            .from('connections')
            .insert(connections.map(c => ({
                id: c.id,
                from_id: c.fromId,
                from_type: c.fromType,
                to_id: c.toId,
                to_type: c.toType,
                connection_type: c.type,
                label: c.label,
                description: c.description,
                style: c.style,
                bidirectional: c.bidirectional,
                strength: c.strength,
                metadata: c.metadata,
                created_timestamp: c.created,
                updated_timestamp: c.updated
            })))
            .select();

        if (error) throw error;
        return data.map(this.mapRowToConnection);
    }

    async bulkDeleteConnections(connectionIds: string[]): Promise<void> {
        if (connectionIds.length === 0) return;
        const { error } = await supabase
            .from('connections')
            .delete()
            .in('id', connectionIds);

        if (error) throw error;
    }

    private async getWhiteboardIdFromItem(itemId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('whiteboard_items')
            .select('whiteboard_id')
            .eq('id', itemId)
            .single();

        if (error) return null;
        return data.whiteboard_id;
    }

    private mapRowToConnection(row: any): Connection {
        return new Connection(
            row.id,
            row.from_id,
            row.from_type,
            row.to_id,
            row.to_type,
            row.connection_type,
            row.label,
            row.description,
            row.style,
            row.bidirectional,
            row.strength,
            row.metadata,
            row.created_timestamp,
            row.updated_timestamp,
            row.created_at
        );
    }
}