import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { Connection } from '../../domain/entities/connection.entity';
import { supabase } from '../database/supabase_client';

export class ConnectionRepository implements IConnectionRepository {
    async createConnection(connection: Connection): Promise<Connection> {
        if (!connection.fromId || !connection.toId) { 
            throw new Error('Connection must have valid fromId and toId');
        }
      
        if (connection.fromId === connection.toId) {
            throw new Error('Cannot create self-connection');
        }

        // Note: Item existence validation is handled by the controller
      
        // Check for existing connection (bidirectional)
        const existingConnection = await this.getConnectionBetweenItems(
            connection.fromId, 
            connection.toId
        );
      
        if (existingConnection) {
            return existingConnection;
        }
      
        try {
            const whiteboardId = await this.getWhiteboardIdFromItem(connection.fromId);
            
            const { data, error } = await supabase
              .from('connections')
              .insert([{
                id: connection.id || crypto.randomUUID(),
                from_id: connection.fromId,
                from_type: connection.fromType || 'unknown',
                to_id: connection.toId,
                to_type: connection.toType || 'unknown',
                connection_type: connection.type || 'association',
                label: connection.label || null,
                description: connection.description || null,
                bidirectional: connection.bidirectional || false,
                strength: connection.strength || 3,
                style: connection.style || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_timestamp: Date.now(),
                updated_timestamp: Date.now(),
                metadata: connection.metadata || null,
                whiteboard_id: whiteboardId
              }])
              .select()
              .single();
      
            if (error) {
                // Handle specific database errors gracefully
                if (error.code === '23505') {
                    const existing = await this.getConnectionBetweenItems(connection.fromId, connection.toId);
                    if (existing) {
                        return existing;
                    }
                }
                
                if (error.code === '23503') {
                    console.error('Foreign key constraint violation:', error);
                }
                
                if (error.code === '23502') {
                    // Not null constraint violation
                    console.error('Not null constraint violation:', error);
                }
                
                console.error('Supabase error creating connection:', error);
                throw new Error(`Database error: ${error.message}`);
            }
      
            return this.mapRowToConnection(data);
        } catch (error) {
            console.error('Error creating connection:', error);
            throw error;
        }
    }

    async getConnectionBetweenItems(fromId: string, toId: string) {
        const { data, error } = await supabase
          .from('connections')
          .select('*')
          .or(`and(from_id.eq.${fromId},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${fromId})`)
          .limit(1);
    
        if (error) {
          console.error('Error checking existing connection:', error);
          return null;
        }
    
        return data?.[0] || null;
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
                from_type: c.fromType || 'unknown',
                to_id: c.toId,
                to_type: c.toType || 'unknown',
                connection_type: c.type || 'association',
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

    async cleanupOrphanedConnections(): Promise<number> {
        try {
            // Find connections where either from_id or to_id doesn't exist in whiteboard_items
            const { data: orphanedConnections, error: findError } = await supabase
                .from('connections')
                .select('id')
                .or('from_id.not.in.(select id from whiteboard_items),to_id.not.in.(select id from whiteboard_items)');

            if (findError) {
                console.error('Error finding orphaned connections:', findError);
                return 0;
            }

            if (!orphanedConnections || orphanedConnections.length === 0) {
                return 0;
            }

            const orphanedIds = orphanedConnections.map(conn => conn.id);
            
            // Delete orphaned connections
            const { error: deleteError } = await supabase
                .from('connections')
                .delete()
                .in('id', orphanedIds);

            if (deleteError) {
                console.error('Error deleting orphaned connections:', deleteError);
                return 0;
            }

            return orphanedIds.length;
        } catch (error) {
            console.error('Error in cleanupOrphanedConnections:', error);
            return 0;
        }
    }

    private async checkItemExists(itemId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('whiteboard_items')
                .select('id')
                .eq('id', itemId)
                .single();

            return !error && data !== null;
        } catch (error) {
            return false;
        }
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