"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("@supabase/supabase-js");
const auth_1 = require("../middlewares/auth");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
router.post('/', auth_1.authenticate, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${crypto_1.default.randomUUID()}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;
        const { data, error } = await supabase
            .storage
            .from('complaints')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });
        if (error) {
            console.error('Supabase upload error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
            return;
        }
        const { data: publicUrlData } = supabase
            .storage
            .from('complaints')
            .getPublicUrl(filePath);
        res.json({ imageUrl: publicUrlData.publicUrl });
    }
    catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({ error: 'Internal server error during upload' });
    }
});
exports.default = router;
