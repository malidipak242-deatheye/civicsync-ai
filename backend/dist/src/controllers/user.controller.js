"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkers = void 0;
const index_1 = require("../index");
const client_1 = require("@prisma/client");
const getWorkers = async (req, res) => {
    try {
        const workers = await index_1.prisma.user.findMany({
            where: {
                role: client_1.Role.WORKER,
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
    }
    catch (error) {
        console.error('Fetch workers error:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
};
exports.getWorkers = getWorkers;
