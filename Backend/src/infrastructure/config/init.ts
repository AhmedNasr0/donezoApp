export const databaseConfig = {
    postgresUrl: 'postgresql://taskdb_k6cv_user:6dCazhg5QpbS70dLImDxI4p0DqS6wOa3@dpg-d2ohb324d50c739ue2o0-a.oregon-postgres.render.com/taskdb_k6cv',
    redisUrl: 'rediss://red-d2ohqaggjchc73ep7oo0:91qTkwnGS1APbmiIWDjrRGEI35RA5rYk@oregon-keyvalue.render.com:6379'
}

type appConfig ={
    port: number
}

export const appConfig : appConfig = {
    port: Number(process.env.PORT) || 3000 
}