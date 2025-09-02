import { Request, Response } from "express";
import { SupabaseUserRepository } from "../../infrastructure/repositories/supabaseUserRepositoryImp";

const userRepo = new SupabaseUserRepository();

export class UserController {

  static async createUser(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await userRepo.createUser(email);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      const user = await userRepo.getUserByEmail(email);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}