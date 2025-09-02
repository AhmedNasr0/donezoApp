import { WhiteboardItem } from "./whiteboardItem.entity";
import { Connection } from "./connection.entity";

export class Whiteboard {
    constructor(
        public readonly id: string,
        public readonly user_id: string,
        public readonly title: string,
        public whiteboard_items: WhiteboardItem[],
        public whiteboard_connections: Connection[] = [],
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) {}

    addItem(item: WhiteboardItem) {
        this.whiteboard_items.push(item);
    }

    removeItem(itemId: string) {
        this.whiteboard_items = this.whiteboard_items.filter(
            item => item.id !== itemId
        );
        // Also remove connections related to this item
        this.removeConnectionsForItem(itemId);
    }

    getItems() {
        return this.whiteboard_items;
    }

    addConnection(connection: Connection) {
        this.whiteboard_connections.push(connection);
    }

    removeConnection(connectionId: string) {
        this.whiteboard_connections = this.whiteboard_connections.filter(
            conn => conn.id !== connectionId
        );
    }

    removeConnectionsForItem(itemId: string) {
        this.whiteboard_connections = this.whiteboard_connections.filter(
            conn => conn.fromId !== itemId && conn.toId !== itemId
        );
    }

    getConnections() {
        return this.whiteboard_connections;
    }

    getConnectionsForItem(itemId: string) {
        return this.whiteboard_connections.filter(
            conn => conn.fromId === itemId || conn.toId === itemId
        );
    }

    // Convert to format expected by frontend
    toFrontendFormat() {
        return {
            id: this.id,
            user_id: this.user_id,
            title: this.title,
            items: this.whiteboard_items,
            connections: this.whiteboard_connections.map(conn => conn.toFrontendFormat()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}