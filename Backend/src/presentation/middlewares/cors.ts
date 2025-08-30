import cors from 'cors'

export const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:9002',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

export const corsMiddleware = cors(corsOptions)