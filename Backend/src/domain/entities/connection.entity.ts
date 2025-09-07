export type ConnectionType = 
  | 'flow' 
  | 'dependency' 
  | 'association' 
  | 'inheritance' 
  | 'composition' 
  | 'aggregation'
  | 'communication'
  | 'reference';

export type ConnectionStyle = {
  color: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  arrowType: 'none' | 'arrow' | 'diamond' | 'circle' | 'square';
  animated?: boolean;
};

export class Connection {
    constructor(
        public readonly id: string,
        public readonly fromId: string,
        public readonly fromType: string,
        public readonly toId: string,
        public readonly toType: string,
        public readonly type: ConnectionType = 'association',
        public readonly label?: string,
        public readonly description?: string,
        public readonly style?: Partial<ConnectionStyle>,
        public readonly bidirectional: boolean = false,
        public readonly strength: number = 3,
        public readonly metadata?: Record<string, any>,
        public readonly created: number = Date.now(),
        public readonly updated: number = Date.now(),
        public readonly createdAt?: Date,
        
    ) {}

    static fromFrontendConnection(frontendConn: any, fromType: string, toType: string): Connection {
        return new Connection(
            frontendConn.id,
            frontendConn.from,
            fromType,
            frontendConn.to,
            toType,
            frontendConn.type || 'association',
            frontendConn.label,
            frontendConn.description,
            frontendConn.style,
            frontendConn.bidirectional || false,
            frontendConn.strength || 3,
            frontendConn.metadata,
            frontendConn.created,
            frontendConn.updated,
            new Date()
        );
    }

    toFrontendFormat(): any {
        return {
            id: this.id,
            from: this.fromId,
            to: this.toId,
            type: this.type,
            label: this.label,
            description: this.description,
            style: this.style,
            bidirectional: this.bidirectional,
            strength: this.strength,
            metadata: this.metadata,
            created: this.created,
            updated: this.updated
        };
    }
}