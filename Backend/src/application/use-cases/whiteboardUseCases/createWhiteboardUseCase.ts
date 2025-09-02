import { IWhiteboardRepository } from "../../../domain/repositories/IWhiteboardRepository";
import { Whiteboard } from "../../../domain/entities/whiteboard.entity"

export class CreateWhiteboardUseCase {
  constructor(private whiteboardRepo: IWhiteboardRepository) {}

  async execute(title: string, userId: string): Promise<Whiteboard> {
    const newWhiteboard = new Whiteboard(
        crypto.randomUUID(), // id
        userId,              // user_id
        title,               // title
        []                   // whiteboard_items
    );

    return await this.whiteboardRepo.createWhiteboard(newWhiteboard);
  }
}
