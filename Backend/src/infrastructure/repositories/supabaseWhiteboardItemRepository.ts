import { WhiteboardItem } from "../../domain/entities/whiteboardItem.entity";
import { IWhiteboardItemRepository } from "../../domain/repositories/IWhiteboardItemRepository";
import { supabase } from "../database/supabase_client";

export class WhiteboardItemRepository implements IWhiteboardItemRepository {
    
    async findByWhiteboardId(whiteboardId: string): Promise<WhiteboardItem[]> {
        const { data, error } = await supabase
            .from("whiteboard_items")
            .select("*")
            .eq("whiteboard_id", whiteboardId);

        if (error) throw error;

        return (data || []).map((row: any) =>
            new WhiteboardItem(
                row.id,
                row.type,
                row.title,
                row.content,
                row.position, // JSON {x,y}
                row.size,     // JSON {width,height}
                row.z_index,
                row.is_attached,
                row.is_locked,
                new Date(row.created_at),
                new Date(row.updated_at),
                row.whiteboard_id
            )
        );
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

        if (error) throw error;

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
            data.whiteboard_id
        );
    }

    async deleteItem(id: string): Promise<void> {
        const { error } = await supabase
            .from("whiteboard_items")
            .delete()
            .eq("id", id);

        if (error) throw error;
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
        const result = new WhiteboardItem(
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
            data.whiteboard_id
        );

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
                data.whiteboard_id
            );
            
            return item;
        } catch (constructorError) {
            console.error("Error creating WhiteboardItem:", constructorError);
            throw constructorError;
        }
    }
}
