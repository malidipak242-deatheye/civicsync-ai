import { Router, Request, Response } from 'express';
import { createComplaint, getComplaints, updateComplaintStatus, assignComplaint } from '../controllers/complaint.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createComplaintSchema, updateComplaintStatusSchema } from '../validators/complaint.validator';
import { prisma } from '../index';
import { Role } from '@prisma/client';

const router = Router();

// Public stats endpoint (no auth required)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [total, resolved, inProgress, submitted] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { status: 'SUBMITTED' } }),
    ]);
    res.json({ total, resolved, inProgress, submitted, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 });
  } catch {
    res.json({ total: 0, resolved: 0, inProgress: 0, submitted: 0, resolutionRate: 0 });
  }
});

router.use(authenticate);

// All authenticated users can fetch their relevant complaints
router.get('/', getComplaints);

// Only citizens can submit new complaints
router.post('/', authorize([Role.CITIZEN]), validate(createComplaintSchema), createComplaint);

// Workers and Admins can update statuses
router.patch('/:id/status', authorize([Role.WORKER, Role.DEPARTMENT_MANAGER, Role.SUPER_ADMIN]), validate(updateComplaintStatusSchema), updateComplaintStatus);

// Admins and Managers can assign a worker
router.patch('/:id/assign', authorize([Role.DEPARTMENT_MANAGER, Role.SUPER_ADMIN]), assignComplaint);


export default router;
