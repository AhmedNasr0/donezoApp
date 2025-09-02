import { User } from "../entities/user.entitiy";


export interface IUserRepository{
    createUser(email:string):Promise<User>,
    getUserByEmail(email:string):Promise<User>,

}