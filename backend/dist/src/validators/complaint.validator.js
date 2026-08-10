"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatusSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createComplaintSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        address: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url().optional(),
    })
});
exports.updateComplaintStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.ComplaintStatus),
        notes: zod_1.z.string().optional(),
        afterPhotoUrl: zod_1.z.string().url().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    })
});
