import { AppError } from './appError'

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400)
    }
}