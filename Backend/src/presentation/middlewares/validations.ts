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

export const validateChatRequest = [
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

function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(error => error.msg).join(', ')
        throw new ValidationError(errorMessage)
    }
    next()
}