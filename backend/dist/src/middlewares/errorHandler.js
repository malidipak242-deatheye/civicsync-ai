"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('Error Handler:', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.issues
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
