import * as express from 'express'
export class AppError extends Error {
    cause: string
    constructor(message?: string, cause?: string, request?: express.Request) {
        super(message);
        this.cause = cause
    }
}