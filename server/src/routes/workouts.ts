import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const startWorkoutSchema = z.object({
    routineId: z.string().optional(),
    name: z.string().optional()
});

const saveWorkoutSchema = z.object({
    endedAt: z.string().datetime(),
    duration: z.number(),
    sets: z.array(z.object({
        exerciseId: z.string(),
        seriesIndex: z.number(),
        reps: z.number(),
        weight: z.number(),
        completed: z.boolean()
    }))
});

// Start workout
router.post('/start', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { routineId, name } = startWorkoutSchema.parse(req.body);
        const workout = await prisma.workout.create({
            data: {
                userId: req.user!.userId,
                routineId,
                name: name || 'Entraînement libre',
                startedAt: new Date()
            }
        });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save/Finish workout (Update)
router.put('/:id/finish', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { endedAt, duration, sets } = saveWorkoutSchema.parse(req.body);

        // Verify ownership
        const workout = await prisma.workout.findUnique({ where: { id } });
        if (!workout || workout.userId !== req.user!.userId) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const updatedWorkout = await prisma.workout.update({
            where: { id },
            data: {
                endedAt: new Date(endedAt),
                duration,
                sets: {
                    create: sets.map(set => ({
                        exerciseId: set.exerciseId,
                        seriesIndex: set.seriesIndex,
                        reps: set.reps,
                        weight: set.weight,
                        completed: set.completed
                    }))
                }
            },
            include: { sets: true }
        });

        res.json(updatedWorkout);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const workouts = await prisma.workout.findMany({
            where: {
                userId: req.user!.userId,
                endedAt: { not: null }
            },
            orderBy: { startedAt: 'desc' },
            include: { sets: { include: { exercise: true } } }
        });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
