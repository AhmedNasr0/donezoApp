import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import { ValidationError } from '../../shared/errors/validationError'

export const validateUploadRequest = [
    body('url')
        .notEmpty()
        .withMessage('URL is required')
        .isURL()
        .withMessage('Must be a valid URL'),
    body('platform')
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(['youtube', 'tiktok', 'instagram'])
        .withMessage('Platform must be youtube, tiktok, or instagram'),
    body('title')
        .optional()
        .isString()
        .withMessage('Title must be a string'),
    handleValidationErrors
]

export const validateChatMsgRequest = [
    body('question')
        .notEmpty()
        .withMessage('Question is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Question must be between 1 and 1000 characters'),
    handleValidationErrors
]

export const validateJobId = [
    param('jobId')
        .notEmpty()
        .withMessage('Job ID is required')
        .isUUID()
        .withMessage('Job ID must be a valid UUID'),
    handleValidationErrors
]

export const validateConnectionRequest = (req: Request, res: Response, next: NextFunction) => {
    const { fromId, toId, fromType, toType } = req.body;

    if (!fromId || !toId || !fromType || !toType) {
        return next(new ValidationError('fromId, toId, fromType, and toType are required'));
    }

    if (typeof fromId !== 'string' || typeof toId !== 'string') {
        return next(new ValidationError('fromId and toId must be strings'));
    }

    if (typeof fromType !== 'string' || typeof toType !== 'string') {
        return next(new ValidationError('fromType and toType must be strings'));
    }

    next();
};

export const validateUpdateConnectionRequest = (req: Request, res: Response, next: NextFunction) => {
    const { fromId, toId, fromType, toType } = req.body;

    if (fromId && typeof fromId !== 'string') {
        return next(new ValidationError('fromId must be a string'));
    }

    if (toId && typeof toId !== 'string') {
        return next(new ValidationError('toId must be a string'));
    }

    if (fromType && typeof fromType !== 'string') {
        return next(new ValidationError('fromType must be a string'));
    }

    if (toType && typeof toType !== 'string') {
        return next(new ValidationError('toType must be a string'));
    }

    next();
};

export const validateChatRequest = (req: Request, res: Response, next: NextFunction) => {
    const { chat_name } = req.body;

    if (!chat_name || chat_name.trim().length === 0) {
        return next(new ValidationError('Chat name is required'));
    }

    if (typeof chat_name !== 'string') {
        return next(new ValidationError('Chat name must be a string'));
    }

    next();
};

export const validateUpdateChatRequest = (req: Request, res: Response, next: NextFunction) => {
    const { chat_name, numOfConnections } = req.body;

    if (chat_name && typeof chat_name !== 'string') {
        return next(new ValidationError('Chat name must be a string'));
    }

    if (numOfConnections !== undefined && typeof numOfConnections !== 'number') {
        return next(new ValidationError('numOfConnections must be a number'));
    }

    next();
};

function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(error => error.msg).join(', ')
        throw new ValidationError(errorMessage)
    }
    next()
}