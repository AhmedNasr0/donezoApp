

export class Connection{
    constructor(
        public readonly id: string,
        public readonly fromId:string,
        public readonly fromType: string,
        public readonly toId:string ,
        public readonly toType:string,
        public readonly createdAt?:Date
    ){

    }
}