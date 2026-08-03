import { Request, Response } from 'express';
import { prisma } from '../index';
import { Role } from '@prisma/client';

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = await prisma.user.findMany({
      where: {
        role: Role.WORKER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(workers);
  } catch (error) {
    console.error('Fetch workers error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};
