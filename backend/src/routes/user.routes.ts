import { Router } from 'express';
import { getWorkers } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Only Admins and Department Managers can fetch the worker list
router.get('/workers', authorize([Role.SUPER_ADMIN, Role.DEPARTMENT_MANAGER]), getWorkers);

export default router;
