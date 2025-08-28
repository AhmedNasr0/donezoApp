import { Job } from "../entities/job.entity";


export interface IJobRepository{
    save(job:Job):Promise<void>
    findAll():Promise<Job[]>
    findById(id:string):Promise<Job|null>
    update(job:Job):Promise<void>
}