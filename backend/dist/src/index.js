"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.31.118:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: true, // Allow any origin in production for ease of testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' })); // 10mb to handle base64 images
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const complaint_routes_1 = __importDefault(require("./routes/complaint.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/complaints', complaint_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'CivicSync AI API is running' });
});
const errorHandler_1 = require("./middlewares/errorHandler");
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
module.exports = app;
