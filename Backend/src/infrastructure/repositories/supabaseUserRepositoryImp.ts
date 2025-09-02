import { supabase } from "../database/supabase_client"; 
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/user.entitiy";

export class SupabaseUserRepository implements IUserRepository {


  async createUser(email: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([{ email }])
      .select()
      .single();

    if (error || !data) throw new Error(error?.message);
    return new User( data.email);
  }

  async getUserByEmail(email: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) throw new Error(error?.message || "User not found");
    return new User(data.email);
  }
}
