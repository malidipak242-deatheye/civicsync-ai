import { Request, Response } from 'express';
import { prisma } from '../index';
import { analyzeComplaintImage } from '../services/ai.service';
import { Priority, ComplaintStatus } from '@prisma/client';

export const createComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, latitude, longitude, address, imageUrl } = req.body;
    const citizenId = req.user!.id;

    // Optional: Call Gemini API if an image URL is provided and user hasn't overridden AI
    let aiData = null;
    if (imageUrl && (!title || !category)) {
      aiData = await analyzeComplaintImage(imageUrl);
    }

    const complaint = await prisma.complaint.create({
      data: {
        title: title || aiData?.title || 'Untitled Issue',
        description: description || aiData?.summary || 'No description provided',
        category: category || aiData?.category || 'Other',
        priority: priority || aiData?.priority || Priority.LOW,
        latitude,
        longitude,
        address,
        aiCategory: aiData?.category,
        aiPriority: aiData?.priority as Priority,
        aiConfidence: aiData?.confidence,
        aiSummary: aiData?.summary,
        citizenId,
        images: imageUrl ? {
          create: [{ url: imageUrl }]
        } : undefined
      },
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    console.error('Create complaint error:', error);
    
    // Handle Prisma foreign key constraint failure (e.g. citizenId doesn't exist)
    if (error.code === 'P2003') {
      res.status(401).json({ error: 'User session invalid or user not found. Please log in again.' });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to create complaint', 
      details: error.message || 'Unknown database error' 
    });
  }
};

export const getComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, id } = req.user!;
    let whereClause = {};

    if (role === 'CITIZEN') {
      whereClause = { citizenId: id };
    } else if (role === 'WORKER') {
      whereClause = { workerId: id };
    }
    // Admins and Department Managers can see all or filter by department

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        images: true,
        citizen: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const status = String(req.body.status);
    const notes = req.body.notes ? String(req.body.notes) : undefined;
    const afterPhotoUrl = req.body.afterPhotoUrl ? String(req.body.afterPhotoUrl) : undefined;
    const userId = req.user!.id;

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: status as ComplaintStatus,
        statusHistory: {
          create: {
            status: status as ComplaintStatus,
            notes,
            changedById: userId
          }
        },
        ...(afterPhotoUrl && {
          images: {
            create: {
              url: afterPhotoUrl,
              isAfterPhoto: true
            }
          }
        }),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() })
      }
    });

    res.json(complaint);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const assignComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const workerId = String(req.body.workerId);
    const userId = req.user!.id;

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        workerId,
        status: ComplaintStatus.ASSIGNED,
        statusHistory: {
          create: {
            status: ComplaintStatus.ASSIGNED,
            notes: 'Assigned to worker',
            changedById: userId
          }
        }
      }
    });

    res.json(complaint);
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ error: 'Failed to assign complaint' });
  }
};
