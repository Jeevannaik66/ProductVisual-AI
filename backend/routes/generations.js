// backend/routes/generate.js
import express from 'express';
import {
  generateHandler,
  saveGenerationHandler,
  getGenerationsHandler,
  deleteGenerationHandler
} from '../controllers/imageController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// ✅ Generate image (optional auth: allow guests)
// optional auth for generation (guests allowed)
router.post('/', optionalAuthMiddleware, asyncHandler(generateHandler));

// ✅ Save generation metadata
router.post('/save', authMiddleware, asyncHandler(saveGenerationHandler));

// ✅ Fetch all generations for logged-in user
router.get('/generations', authMiddleware, asyncHandler(getGenerationsHandler));

// ✅ Delete a specific generation by ID
router.delete('/generations/:id', authMiddleware, asyncHandler(deleteGenerationHandler));

export default router;
