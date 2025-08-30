export interface CreateConnectionRequestDTO {
    fromId: string;
    fromType: string;
    toId: string;
    toType: string;
}

export interface UpdateConnectionRequestDTO {
    id: string;
    fromId?: string;
    fromType?: string;
    toId?: string;
    toType?: string;
}

export interface ConnectionQueryDTO {
    entityId?: string;
    entityType?: string;
}