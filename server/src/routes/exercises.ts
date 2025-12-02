import express from 'express';
import prisma from '../utils/db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all exercises (with optional search/filter)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, target } = req.query;

        const where: any = {};
        if (search) {
            where.name = { contains: String(search), mode: 'insensitive' };
        }
        if (target) {
            where.target = String(target);
        }

        const exercises = await prisma.exercise.findMany({
            where,
            take: 50 // Limit results
        });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
