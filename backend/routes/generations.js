// backend/routes/generate.js
import express from 'express';
import {
  generateHandler,
  saveGenerationHandler,
  getGenerationsHandler,
  deleteGenerationHandler
} from '../controllers/imageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Generate image
router.post('/', authMiddleware, generateHandler);

// ✅ Save generation metadata
router.post('/save', authMiddleware, saveGenerationHandler);

// ✅ Fetch all generations for logged-in user
router.get('/generations', authMiddleware, getGenerationsHandler);

// ✅ Delete a specific generation by ID
router.delete('/generations/:id', authMiddleware, deleteGenerationHandler);

export default router;
