import { Connection } from "./connection.entity";

export class WhiteboardItem {
    constructor(
        public id: string,
        public type: string, // 'ai' | 'youtube' | 'tiktok' | 'instagram' | 'doc' | 'image' | 'url' | 'social'
        public title: string,
        public content: string,
        public position: { x: number; y: number },
        public size: { width: number; height: number },
        public zIndex: number = 1,
        public isAttached: boolean = false,
        public isLocked: boolean = false,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public connections:Connection[]=[],
        public whiteboardId: string,
    ) {}
}