import { Router, Request, Response } from 'express';
import { analyzeComplaintImage } from '../services/ai.service';

const router = Router();

// POST /api/ai/analyze
// Body: { imageBase64: string, mimeType?: string }
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageUrl, mimeType } = req.body;

    if (!imageBase64 && !imageUrl) {
      res.status(400).json({ error: 'imageBase64 or imageUrl is required' });
      return;
    }

    const imageData = imageBase64 || imageUrl;
    const result = await analyzeComplaintImage(imageData, mimeType || 'image/jpeg');

    if (!result) {
      res.status(500).json({ error: 'AI analysis failed' });
      return;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
