import { Connection } from "../../domain/entities/connection.entity";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { CreateConnectionRequestDTO, UpdateConnectionRequestDTO, ConnectionQueryDTO } from "../dtos/connectionDTO";
import { v4 as uuidv4 } from 'uuid';

export class ConnectionUseCase {
    constructor(private connectionRepository: IConnectionRepository) {}

    async createConnection(dto: CreateConnectionRequestDTO): Promise<Connection> {
        // Check if connection already exists
        const exists = await this.connectionRepository.connectionExists(dto.fromId, dto.toId);
        if (exists) {
            throw new Error('Connection already exists between these entities');
        }

        const connection: Connection = {
            id: uuidv4(),
            fromId: dto.fromId,
            fromType: dto.fromType,
            toId: dto.toId,
            toType: dto.toType,
            createdAt: new Date()
        };

        return await this.connectionRepository.createConnection(connection);
    }

    async getConnectionById(id: string): Promise<Connection | null> {
        return await this.connectionRepository.findConnectionsByID(id);
    }

    async getAllConnections(): Promise<Connection[]> {
        return await this.connectionRepository.findAllConnections();
    }

    async getConnectionsForEntity(dto: ConnectionQueryDTO): Promise<Connection[]> {
        if (!dto.entityId) {
            return await this.connectionRepository.findAllConnections();
        }
        return await this.connectionRepository.findConnectionsForEntity(dto.entityId, dto.entityType as any);
    }

    async updateConnection(dto: UpdateConnectionRequestDTO): Promise<Connection> {
        const existingConnection = await this.connectionRepository.findConnectionsByID(dto.id);
        if (!existingConnection) {
            throw new Error('Connection not found');
        }

        const updatedConnection: Connection = {
            ...existingConnection,
            ...(dto.fromId && { fromId: dto.fromId }),
            ...(dto.fromType && { fromType: dto.fromType }),
            ...(dto.toId && { toId: dto.toId }),
            ...(dto.toType && { toType: dto.toType })
        };

        return await this.connectionRepository.updateConnection(updatedConnection);
    }

    async deleteConnection(id: string): Promise<void> {
        const connection = await this.connectionRepository.findConnectionsByID(id);
        if (!connection) {
            throw new Error('Connection not found');
        }
        await this.connectionRepository.deleteConnection(id);
    }

    async disconnectEntities(fromId: string, toId: string): Promise<void> {
        const connections = await this.connectionRepository.findAllConnections();
        const connection = connections.find(conn => 
            (conn.fromId === fromId && conn.toId === toId) ||
            (conn.fromId === toId && conn.toId === fromId)
        );
        
        if (connection) {
            await this.connectionRepository.deleteConnection(connection.id);
        }
    }
}
