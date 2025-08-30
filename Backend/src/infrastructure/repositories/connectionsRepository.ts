import { Connection } from "../../domain/entities/connection.entity";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { DatabaseConnection } from "../database/connection";

export class ConnectionRepository implements IConnectionRepository {
    private db: DatabaseConnection
    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    async createConnection(connection: Connection): Promise<Connection> {
        const query = `
            INSERT INTO connections (id, fromId, fromType, toId, toType, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            connection.id,
            connection.fromId.toString(),
            connection.fromType.toString(),
            connection.toId.toString(),
            connection.toType.toString(),
            connection.createdAt
        ];
        const result = await this.db.query(query, values);
        return result.rows[0] as Connection;
    }

    async findConnectionsByID(id: string): Promise<Connection | null> {
        const query = `SELECT * FROM connections WHERE id = $1`;
        const values = [id];
        const result = await this.db.query(query, values);
        return result.rows[0] ? (result.rows[0] as Connection) : null;
    }

    async updateConnection(connection: Connection): Promise<Connection> {
        const query = `
            UPDATE connections 
            SET fromId = $1, fromType = $2, toId = $3, toType = $4, createdAt = $5 
            WHERE id = $6
            RETURNING *
        `;
        const values = [
            connection.fromId,
            connection.fromType,
            connection.toId,
            connection.toType,
            connection.createdAt,
            connection.id
        ];
        const result = await this.db.query(query, values);
        return result.rows[0] as Connection;
    }

    async findAllConnections(): Promise<Connection[]> {
        const query = `SELECT * FROM connections ORDER BY createdAt DESC`;
        const result = await this.db.query(query, []);
        return result.rows as Connection[];
    }

    async findConnectionsForEntity(entityId: string, entityType?: string): Promise<Connection[]> {
        let query = `
            SELECT * FROM connections 
            WHERE (fromId = $1 OR toId = $1)
        `;
        const values = [entityId];
        
        if (entityType) {
            query += ` AND (fromType = $2 OR toType = $2)`;
            values.push(entityType);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const result = await this.db.query(query, values);
        return result.rows as Connection[];
    }

    async deleteConnection(id: string): Promise<void> {
        const query = `DELETE FROM connections WHERE id = $1`;
        const values = [id];
        await this.db.query(query, values);
    }

    async connectionExists(fromId: string, toId: string): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count FROM connections 
            WHERE (fromId = $1 AND toId = $2) OR (fromId = $2 AND toId = $1)
        `;
        const values = [fromId, toId];
        const result = await this.db.query(query, values);
        return parseInt(result.rows[0].count) > 0;
    }
    
    async findConnectionIdsForEntity(entityId: string, entityType?: string): Promise<string[]> {
        let query = `
            SELECT 
                CASE
                    WHEN fromId = $1 THEN toId
                    ELSE fromId
                END AS connectedId
            FROM connections
            WHERE (fromId = $1 OR toId = $1)
        `;
        const values = [entityId];
    
        if (entityType) {
            query += ` AND (fromType = $2 OR toType = $2)`;
            values.push(entityType);
        }
    
        query += ` ORDER BY created_at DESC`;
    
        const result = await this.db.query(query, values);
        return result.rows.map((row: { connectedid: string }) => row.connectedid);
    }
    
}