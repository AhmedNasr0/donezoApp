import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../shared/errors/AppError'
import { logger } from '../../shared/utils/logger'

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    })

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        })
        return
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            details: error.message
        })
        return
    }

    // Handle Mongoose cast errors
    if (error.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        })
        return
    }

    // Handle duplicate key errors
    if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Resource already exists'
        })
        return
    }

    // Default server error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
}