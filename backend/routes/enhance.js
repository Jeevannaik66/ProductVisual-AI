// backend/routes/enhance.js
import express from 'express';
import { enhanceHandler } from '../controllers/imageController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * POST /api/enhance
 * Body: { prompt }
 * Returns: { enhancedPrompt }
 * Public route (no auth required)
 */
router.post('/', asyncHandler(enhanceHandler));

export default router;
