import { Connection } from "../entities/connection.entity";

export interface IConnectionRepository {
    createConnection(connection: Connection): Promise<Connection>;
    findConnectionsByID(id: string): Promise<Connection | null>;
    findConnectionsByWhiteboard(whiteboardId: string): Promise<Connection[]>;
    updateConnection(connection: Connection): Promise<Connection>;
    findAllConnections(): Promise<Connection[]>;
    deleteConnection(id: string): Promise<void>;
    findConnectionsForEntity(entityId: string, type?: string): Promise<Connection[]>;
    findConnectionIdsForEntity(entityId: string, type?: string): Promise<string[]>;
    connectionExists(fromID: string, toID: string): Promise<boolean>;
    deleteConnectionsForItem(itemId: string): Promise<void>;
    bulkCreateConnections(connections: Connection[]): Promise<Connection[]>;
    bulkDeleteConnections(connectionIds: string[]): Promise<void>;
}