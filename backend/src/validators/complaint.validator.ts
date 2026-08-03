import { z } from 'zod';
import { Priority, ComplaintStatus } from '@prisma/client';

export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    imageUrl: z.string().url().optional(),
  })
});

export const updateComplaintStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ComplaintStatus),
    notes: z.string().optional(),
    afterPhotoUrl: z.string().url().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});
