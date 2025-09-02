import { Request, Response } from 'express';
import { IWhiteboardRepository } from '../../domain/repositories/IWhiteboardRepository';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { IWhiteboardItemRepository } from '../../domain/repositories/IWhiteboardItemRepository';
import { Whiteboard } from '../../domain/entities/whiteboard.entity';
import { Connection } from '../../domain/entities/connection.entity';

export class WhiteboardController {
    constructor(
        private whiteboardRepository: IWhiteboardRepository,
        private connectionRepository: IConnectionRepository,
        private whiteboardItemRepository: IWhiteboardItemRepository
    ) {}

    async getUserWhiteboard(req: Request, res: Response) {
        try {
            const { email  } = req.params;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
            const whiteboard = await this.whiteboardRepository.getUserWhiteboard(email);
            if (!whiteboard) {
                return res.status(404).json({
                    success: false,
                    message: 'Whiteboard not found',
                    data: null
                });
            }

            // Get all connections for this whiteboard
            const connections = await this.connectionRepository.findConnectionsByWhiteboard(whiteboard.id);

            // Get all items for this whiteboard
            const items = await this.whiteboardItemRepository.findByWhiteboardId(whiteboard.id);

            return res.status(200).json({
                success: true,
                data: {
                    id: whiteboard.id,
                    title: whiteboard.title,
                    items: items,
                    connections: connections.map(conn => conn.toFrontendFormat()),
                    chatData: null // Add if needed
                }
            });

        } catch (error) {
            console.error('Error getting user whiteboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getWhiteboardByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({
                success: false,
                message: 'ID is required'
            });

            const whiteboard = await this.whiteboardRepository.getById(id);
            
            if (!whiteboard) {
                return res.status(404).json({
                    success: false,
                    message: 'Whiteboard not found'
                });
            }

            // Get all connections for this whiteboard
            const connections = await this.connectionRepository.findConnectionsByWhiteboard(id);
            
            // Get all items for this whiteboard
            const items = await this.whiteboardItemRepository.findByWhiteboardId(id);

            return res.status(200).json({
                success: true,
                data: {
                    id: whiteboard.id,
                    title: whiteboard.title,
                    items: items,
                    connections: connections.map(conn => conn.toFrontendFormat()),
                    chatData: null
                }
            });

        } catch (error) {
            console.error('Error getting whiteboard by ID:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async createWhiteboard(req: Request, res: Response) {
        try {
            const { userId, title } = req.body;
            
            if (!userId || !title) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and title are required'
                });
            }

            const newWhiteboard = new Whiteboard(
                crypto.randomUUID(),
                userId,
                title,
                [],
                []
            );

            const createdWhiteboard = await this.whiteboardRepository.createWhiteboard(newWhiteboard);

            return res.status(201).json({
                success: true,
                data: {
                    id: createdWhiteboard.id,
                    title: createdWhiteboard.title,
                    items: [],
                    connections: [],
                    chatData: null
                }
            });

        } catch (error) {
            console.error('Error creating whiteboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateWhiteboard(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, items, connections } = req.body;
            if(!id) return res.json({
                success: false,
                message: 'ID is required'
            });


            const existingWhiteboard = await this.whiteboardRepository.getById(id);
            
            if (!existingWhiteboard) {
                return res.status(404).json({
                    success: false,
                    message: 'Whiteboard not found'
                });
            }

            // Update whiteboard basic info
            const updatedWhiteboard = new Whiteboard(
                existingWhiteboard.id,
                existingWhiteboard.user_id,
                title || existingWhiteboard.title,
                items || existingWhiteboard.whiteboard_items,
                connections || existingWhiteboard.whiteboard_connections
            );

            const savedWhiteboard = await this.whiteboardRepository.updateWhiteboard(updatedWhiteboard);

            return res.status(200).json({
                success: true,
                data: savedWhiteboard.toFrontendFormat()
            });

        } catch (error) {
            console.error('Error updating whiteboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async saveWhiteboardState(req: Request, res: Response) {
        try {
            const { whiteboardId, items, connections } = req.body;

            if (!whiteboardId) {
                return res.status(400).json({
                    success: false,
                    message: 'Whiteboard ID is required'
                });
            }

            // Save the complete state including connections
            const savedWhiteboard = await this.whiteboardRepository.saveWhiteboardWithConnections(
                whiteboardId,
                items || [],
                connections || []
            );

            return res.status(200).json({
                success: true,
                data: savedWhiteboard.toFrontendFormat(),
                message: 'Whiteboard state saved successfully'
            });

        } catch (error) {
            console.error('Error saving whiteboard state:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to save whiteboard state',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}