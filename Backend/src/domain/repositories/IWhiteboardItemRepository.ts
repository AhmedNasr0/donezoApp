import { WhiteboardItem } from "../entities/whiteboardItem.entity";



export interface IWhiteboardItemRepository{
    updateItem(item: WhiteboardItem): Promise<WhiteboardItem>,
    deleteItem(id: string): Promise<void>,
    createItem(item: WhiteboardItem): Promise<WhiteboardItem>,
    findById(id:string):Promise<WhiteboardItem|null>,
    findItemsByWhiteboardId(whiteboardId: string):Promise<WhiteboardItem[]>

}