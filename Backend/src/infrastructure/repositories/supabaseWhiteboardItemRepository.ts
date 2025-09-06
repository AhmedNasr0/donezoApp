import { WhiteboardItem } from "../../domain/entities/whiteboardItem.entity";
import { IConnectionRepository } from "../../domain/repositories/IConnectionRepository";
import { IWhiteboardItemRepository } from "../../domain/repositories/IWhiteboardItemRepository";
import { supabase } from "../database/supabase_client";

export class WhiteboardItemRepository implements IWhiteboardItemRepository {

    constructor(
        private connectionRepo: IConnectionRepository
    ){}
    
    async findItemsByWhiteboardId(whiteboardId: string): Promise<WhiteboardItem[]> {
        const { data, error } = await supabase
            .from("whiteboard_items")
            .select("*")
            .eq("whiteboard_id", whiteboardId);

        if (error) throw error;
        const items : WhiteboardItem[] = await Promise.all(
            (data || []).map(async (row: any) =>{
                const itemConnections= await this.connectionRepo.findConnectionsForEntity(row.id);
                
                
                let position = row.position;
                let size = row.size;
                
                if (typeof position === 'string') {
                    try {
                        position = JSON.parse(position);
                    } catch (e) {
                        console.error('Error parsing position JSON:', e, 'Raw position:', position);
                        position = { x: 0, y: 0 };
                    }
                }
                
                if (typeof size === 'string') {
                    try {
                        size = JSON.parse(size);
                    } catch (e) {
                        console.error('Error parsing size JSON:', e, 'Raw size:', size);
                        size = { width: 480, height: 320 };
                    }
                }
                
                
                return new WhiteboardItem(
                    row.id,
                    row.type,
                    row.title,
                    row.content,
                    position, // Parsed JSON {x,y}
                    size,     // Parsed JSON {width,height}
                    row.z_index,
                    row.is_attached,
                    row.is_locked,
                    new Date(row.created_at),
                    new Date(row.updated_at),
                    itemConnections,
                    row.whiteboard_id
                )
        })
    )
        return items 
        
    }

    async updateItem(item: WhiteboardItem): Promise<WhiteboardItem> {
        const { data, error } = await supabase
            .from("whiteboard_items")
            .update({
                type: item.type,
                title: item.title,
                content: item.content,
                position: item.position,
                size: item.size,
                z_index: item.zIndex,
                is_attached: item.isAttached,
                is_locked: item.isLocked || false,
                updated_at: new Date(),
            })
            .eq("id", item.id)
            .select()
            .single();

        if (error) {
            console.error("Repository: Error updating whiteboard item:", error);
            throw error;
        }
        
        
        const connections :any = []
        return new WhiteboardItem(
            data.id,
            data.type,
            data.title,
            data.content,
            data.position,
            data.size,
            data.z_index,
            data.is_attached,
            data.is_locked,
            new Date(data.created_at),
            new Date(data.updated_at),
            connections,
            data.whiteboard_id
        );
    }

    async deleteItem(id: string): Promise<void> {
        
        const { error } = await supabase
            .from("whiteboard_items")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Repository: Error deleting whiteboard item:", error);
            throw error;
        }
        
    }

    async createItem(item: WhiteboardItem): Promise<WhiteboardItem> {
        const { data, error } = await supabase
            .from("whiteboard_items")
            .insert({
                id: item.id,
                type: item.type,
                title: item.title,
                content: item.content,
                position: item.position,
                size: item.size,
                z_index: item.zIndex,
                is_attached: item.isAttached,
                is_locked: item.isLocked || false,
                created_at: item.createdAt || new Date(),
                updated_at: item.updatedAt || new Date(),
                whiteboard_id: item.whiteboardId, 
            })
            .select()
            .single();

        if (error) throw error;
        const connections :any = []
        return new WhiteboardItem(
            data.id,
            data.type,
            data.title,
            data.content,
            data.position,
            data.size,
            data.z_index,
            data.is_attached,
            data.is_locked,
            new Date(data.created_at),
            new Date(data.updated_at),
            connections,
            data.whiteboard_id
        );
    }

    async findById(id: string): Promise<WhiteboardItem | null> {
        const { data, error } = await supabase
            .from("whiteboard_items")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        
    
        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }
    
        if (!data) {
            return null;
        }

        const itemConnections = await this.connectionRepo.findConnectionsForEntity(id);


        try {
            const item = new WhiteboardItem(
                data.id,
                data.type,
                data.title,
                data.content,
                data.position,
                data.size,
                data.z_index,
                data.is_attached,
                data.is_locked,
                new Date(data.created_at),
                new Date(data.updated_at),
                itemConnections,
                data.whiteboard_id
            );
            
            return item;
        } catch (constructorError) {
            console.error("Error creating WhiteboardItem:", constructorError);
            throw constructorError;
        }
    }
}
