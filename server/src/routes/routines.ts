import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const createRoutineSchema = z.object({
    name: z.string().min(1),
    exercises: z.array(z.object({
        exerciseId: z.string(),
        defaultSeries: z.number().optional(),
        defaultReps: z.number().optional(),
        defaultWeight: z.number().optional()
    }))
});

// Get user routines
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const routines = await prisma.routine.findMany({
            where: { userId: req.user!.userId },
            include: { exercises: { include: { exercise: true } } }
        });
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create routine
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { name, exercises } = createRoutineSchema.parse(req.body);

        const routine = await prisma.routine.create({
            data: {
                name,
                userId: req.user!.userId,
                exercises: {
                    create: exercises.map((ex, index) => ({
                        exerciseId: ex.exerciseId,
                        order: index,
                        defaultSeries: ex.defaultSeries || 3,
                        defaultReps: ex.defaultReps || 10,
                        defaultWeight: ex.defaultWeight
                    }))
                }
            },
            include: { exercises: true }
        });

        res.json(routine);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
