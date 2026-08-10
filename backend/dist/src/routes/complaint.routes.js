"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaint_controller_1 = require("../controllers/complaint.controller");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const complaint_validator_1 = require("../validators/complaint.validator");
const index_1 = require("../index");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public stats endpoint (no auth required)
router.get('/stats', async (req, res) => {
    try {
        const [total, resolved, inProgress, submitted] = await Promise.all([
            index_1.prisma.complaint.count(),
            index_1.prisma.complaint.count({ where: { status: 'RESOLVED' } }),
            index_1.prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
            index_1.prisma.complaint.count({ where: { status: 'SUBMITTED' } }),
        ]);
        res.json({ total, resolved, inProgress, submitted, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 });
    }
    catch {
        res.json({ total: 0, resolved: 0, inProgress: 0, submitted: 0, resolutionRate: 0 });
    }
});
router.use(auth_1.authenticate);
// All authenticated users can fetch their relevant complaints
router.get('/', complaint_controller_1.getComplaints);
// Only citizens can submit new complaints
router.post('/', (0, auth_1.authorize)([client_1.Role.CITIZEN]), (0, validate_1.validate)(complaint_validator_1.createComplaintSchema), complaint_controller_1.createComplaint);
// Workers and Admins can update statuses
router.patch('/:id/status', (0, auth_1.authorize)([client_1.Role.WORKER, client_1.Role.DEPARTMENT_MANAGER, client_1.Role.SUPER_ADMIN]), (0, validate_1.validate)(complaint_validator_1.updateComplaintStatusSchema), complaint_controller_1.updateComplaintStatus);
// Admins and Managers can assign a worker
router.patch('/:id/assign', (0, auth_1.authorize)([client_1.Role.DEPARTMENT_MANAGER, client_1.Role.SUPER_ADMIN]), complaint_controller_1.assignComplaint);
exports.default = router;
