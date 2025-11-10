// backend/routes/enhance.js
import express from 'express';
import { enhanceHandler } from '../controllers/imageController.js';

const router = express.Router();

/**
 * POST /api/enhance
 * Body: { prompt }
 * Returns: { enhancedPrompt }
 * Public route (no auth required)
 */
router.post('/', enhanceHandler);

export default router;
