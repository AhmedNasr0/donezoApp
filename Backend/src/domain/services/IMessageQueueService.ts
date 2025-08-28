

export interface IMessageQueueService{
    sendToQueue(queueName:string,data:any):Promise<void>;
    connect():Promise<void>,
    disconnect():Promise<void>
}