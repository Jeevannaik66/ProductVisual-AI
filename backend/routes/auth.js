import express from 'express';
import { signup, login, logout, me } from '../controllers/authController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Signup
router.post('/signup', asyncHandler(signup));

// Login
router.post('/login', asyncHandler(login));

// Logout - clears cookie
router.post('/logout', asyncHandler(logout));

// Get current user from cookie
router.get('/me', asyncHandler(me));

export default router;
