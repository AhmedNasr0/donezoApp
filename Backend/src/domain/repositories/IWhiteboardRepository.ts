import { Whiteboard } from "../entities/whiteboard.entity";
import { Connection } from "../entities/connection.entity";

export interface IWhiteboardRepository {
    createWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard>;
    updateWhiteboard(whiteboard: Whiteboard): Promise<Whiteboard>;
    getUserWhiteboard(userId: string): Promise<Whiteboard | null>;
    getById(id: string): Promise<Whiteboard | null>;
    
    saveWhiteboardWithConnections(
        whiteboardId: string, 
        items: any[], 
        connections: Connection[]
    ): Promise<Whiteboard>;
    
    getWhiteboardWithConnections(whiteboardId: string): Promise<{
        whiteboard: Whiteboard;
        connections: Connection[];
    } | null>;
}