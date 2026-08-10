"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignComplaint = exports.updateComplaintStatus = exports.getComplaints = exports.createComplaint = void 0;
const index_1 = require("../index");
const ai_service_1 = require("../services/ai.service");
const client_1 = require("@prisma/client");
const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, latitude, longitude, address, imageUrl } = req.body;
        const citizenId = req.user.id;
        // Optional: Call Gemini API if an image URL is provided and user hasn't overridden AI
        let aiData = null;
        if (imageUrl && (!title || !category)) {
            aiData = await (0, ai_service_1.analyzeComplaintImage)(imageUrl);
        }
        const complaint = await index_1.prisma.complaint.create({
            data: {
                title: title || aiData?.title || 'Untitled Issue',
                description: description || aiData?.summary || 'No description provided',
                category: category || aiData?.category || 'Other',
                priority: priority || aiData?.priority || client_1.Priority.LOW,
                latitude,
                longitude,
                address,
                aiCategory: aiData?.category,
                aiPriority: aiData?.priority,
                aiConfidence: aiData?.confidence,
                aiSummary: aiData?.summary,
                citizenId,
                images: imageUrl ? {
                    create: [{ url: imageUrl }]
                } : undefined
            },
        });
        res.status(201).json(complaint);
    }
    catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
};
exports.createComplaint = createComplaint;
const getComplaints = async (req, res) => {
    try {
        const { role, id } = req.user;
        let whereClause = {};
        if (role === 'CITIZEN') {
            whereClause = { citizenId: id };
        }
        else if (role === 'WORKER') {
            whereClause = { workerId: id };
        }
        // Admins and Department Managers can see all or filter by department
        const complaints = await index_1.prisma.complaint.findMany({
            where: whereClause,
            include: {
                images: true,
                citizen: { select: { id: true, name: true } },
                worker: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};
exports.getComplaints = getComplaints;
const updateComplaintStatus = async (req, res) => {
    try {
        const id = String(req.params.id);
        const status = String(req.body.status);
        const notes = req.body.notes ? String(req.body.notes) : undefined;
        const afterPhotoUrl = req.body.afterPhotoUrl ? String(req.body.afterPhotoUrl) : undefined;
        const userId = req.user.id;
        const complaint = await index_1.prisma.complaint.update({
            where: { id },
            data: {
                status: status,
                statusHistory: {
                    create: {
                        status: status,
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
    }
    catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
const assignComplaint = async (req, res) => {
    try {
        const id = String(req.params.id);
        const workerId = String(req.body.workerId);
        const userId = req.user.id;
        const complaint = await index_1.prisma.complaint.update({
            where: { id },
            data: {
                workerId,
                status: client_1.ComplaintStatus.ASSIGNED,
                statusHistory: {
                    create: {
                        status: client_1.ComplaintStatus.ASSIGNED,
                        notes: 'Assigned to worker',
                        changedById: userId
                    }
                }
            }
        });
        res.json(complaint);
    }
    catch (error) {
        console.error('Assign complaint error:', error);
        res.status(500).json({ error: 'Failed to assign complaint' });
    }
};
exports.assignComplaint = assignComplaint;
