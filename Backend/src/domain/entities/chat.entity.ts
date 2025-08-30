export class Chat{
    constructor(
        public id : string,
        public chat_name: string,
        public chat_messages: any[],
        public numOfConnections: number
    ){

    }
}