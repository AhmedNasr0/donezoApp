import { Request, Response, NextFunction } from 'express';
import { ConnectionUseCase } from '../../application/use-cases/connectionUseCases';
import { CreateConnectionRequestDTO, UpdateConnectionRequestDTO } from '../../application/dtos/connectionDTO';
import { ValidationError } from '../../shared/errors/validationError';

export class ConnectionController {
    constructor(private connectionUseCase: ConnectionUseCase) {}

    async createConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: CreateConnectionRequestDTO = req.body;

            if (!dto.fromId || !dto.toId || !dto.fromType || !dto.toType) {
                throw new ValidationError('fromId, toId, fromType, and toType are required');
            }

            const connection = await this.connectionUseCase.createConnection(dto);

            res.status(201).json({
                success: true,
                data: connection,
                message: 'Connection created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getConnectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return
            const connection = await this.connectionUseCase.getConnectionById(id);

            if (!connection) {
                res.status(404).json({
                    success: false,
                    message: 'Connection not found'
                });
                return;
            }

            res.json({
                success: true,
                data: connection
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const connections = await this.connectionUseCase.getAllConnections();

            res.json({
                success: true,
                data: connections,
                count: connections.length
            });
        } catch (error) {
            next(error);
        }
    }

    async getConnectionsForEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { entityId, entityType } = req.query;
            
            const connections = await this.connectionUseCase.getConnectionsForEntity({
                entityId: entityId as string,
                entityType: entityType as string
            });

            res.json({
                success: true,
                data: connections,
                count: connections.length
            });
        } catch (error) {
            next(error);
        }
    }

    async updateConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const dto: UpdateConnectionRequestDTO = { ...req.body, id };

            const connection = await this.connectionUseCase.updateConnection(dto);

            res.json({
                success: true,
                data: connection,
                message: 'Connection updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if(!id) return
            await this.connectionUseCase.deleteConnection(id);

            res.json({
                success: true,
                message: 'Connection deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async disconnectEntities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fromId, toId } = req.body;

            if (!fromId || !toId) {
                throw new ValidationError('fromId and toId are required');
            }

            await this.connectionUseCase.disconnectEntities(fromId, toId);

            res.json({
                success: true,
                message: 'Entities disconnected successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}