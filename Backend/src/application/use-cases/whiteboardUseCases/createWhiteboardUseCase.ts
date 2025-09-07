import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";
import { Whiteboard } from "../../../domain/entities/whiteboard.entity"

export class CreateWhiteboardUseCase {
  constructor(private whiteboardRepo: IWhiteboardRepository) {}

  async execute(title: string, userId: string): Promise<Whiteboard> {
    const newWhiteboard = new Whiteboard(
        crypto.randomUUID(), 
        userId,              
        title,               
        []                   
    );

    return await this.whiteboardRepo.createWhiteboard(newWhiteboard);
  }
}
