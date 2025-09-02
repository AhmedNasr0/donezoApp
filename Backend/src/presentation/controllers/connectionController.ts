import { Request, Response } from 'express';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { IWhiteboardItemRepository } from '../../domain/repositories/IWhiteboardItemRepository';
import { Connection } from '../../domain/entities/connection.entity';

export class ConnectionController {
    constructor(
        private connectionRepository: IConnectionRepository,
        private whiteboardItemRepository: IWhiteboardItemRepository
    ) {}

    async createConnection(req: Request, res: Response) {
        try {
            const { fromId, fromType, toId, toType, connectionType = 'association', label, description } = req.body;

            if (!fromId || !toId || !fromType || !toType) {
                return res.status(400).json({
                    success: false,
                    message: 'fromId, toId, fromType, and toType are required'
                });
            }

            const exists = await this.connectionRepository.connectionExists(fromId, toId);
            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: 'Connection already exists between these items'
                });
            }

            const fromItem = await this.whiteboardItemRepository.findById(fromId);
            const toItem = await this.whiteboardItemRepository.findById(toId);

            if (!fromItem || !toItem) {
                return res.status(404).json({
                    success: false,
                    message: 'One or both items not found'
                });
            }
            const newConnection = new Connection(
                crypto.randomUUID(),
                fromId,
                fromType,
                toId,
                toType,
                connectionType,
                label,
                description,
                undefined, // style
                false, // bidirectional
                3, // strength
                undefined, // metadata
                Date.now(),
                Date.now(),
                new Date()
            );

            const createdConnection = await this.connectionRepository.createConnection(newConnection);
            return res.status(201).json({
                success: true,
                data: {
                    id: createdConnection.id,
                    fromId: createdConnection.fromId,
                    toId: createdConnection.toId,
                    type: createdConnection.type
                }
            });

        } catch (error) {
            console.error('Error creating connection:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteConnection(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if(!id) return res.json({
                success: false,
                message: 'id is required'
            })
            const existingConnection = await this.connectionRepository.findConnectionsByID(id);
            if (!existingConnection) {
                return res.status(404).json({
                    success: false,
                    message: 'Connection not found'
                });
            }

            await this.connectionRepository.deleteConnection(id);

            return res.status(200).json({
                success: true,
                message: 'Connection deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting connection:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getConnectionsForItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const { type } = req.query;

            if(!itemId || !type) return res.json({
                success: false,
                message: 'itemId and type are required'
            })

            const connections = await this.connectionRepository.findConnectionsForEntity(
                itemId, 
                type as string
            );

            return res.status(200).json({
                success: true,
                data: connections.map(conn => conn.toFrontendFormat())
            });

        } catch (error) {
            console.error('Error getting connections for item:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateConnection(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if(!id) return res.json({
                success: false,
                message: 'id is required'
            })

            const existingConnection = await this.connectionRepository.findConnectionsByID(id);
            if (!existingConnection) {
                return res.status(404).json({
                    success: false,
                    message: 'Connection not found'
                });
            }

            const updatedConnection = new Connection(
                existingConnection.id,
                existingConnection.fromId,
                existingConnection.fromType,
                existingConnection.toId,
                existingConnection.toType,
                updateData.type || existingConnection.type,
                updateData.label || existingConnection.label,
                updateData.description || existingConnection.description,
                updateData.style || existingConnection.style,
                updateData.bidirectional ?? existingConnection.bidirectional,
                updateData.strength ?? existingConnection.strength,
                updateData.metadata || existingConnection.metadata,
                existingConnection.created,
                Date.now(),
                existingConnection.createdAt
            );

            const savedConnection = await this.connectionRepository.updateConnection(updatedConnection);

            return res.status(200).json({
                success: true,
                data: savedConnection.toFrontendFormat()
            });

        } catch (error) {
            console.error('Error updating connection:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}