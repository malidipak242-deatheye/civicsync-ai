"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Only Admins and Department Managers can fetch the worker list
router.get('/workers', (0, auth_1.authorize)([client_1.Role.SUPER_ADMIN, client_1.Role.DEPARTMENT_MANAGER]), user_controller_1.getWorkers);
exports.default = router;
