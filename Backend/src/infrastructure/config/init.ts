export const databaseConfig = {
    postgresUrl: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/videoTranscription',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
}

type appConfig ={
    port: number
}

export const appConfig : appConfig = {
    port: Number(process.env.PORT) || 3000 
}