import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middlewares/auth';
import crypto from 'crypto';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/', authenticate, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${req.user!.id}/${fileName}`;

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
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
});

export default router;
