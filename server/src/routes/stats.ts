import express from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/summary', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.userId;

        const [totalWorkouts, totalVolume] = await Promise.all([
            prisma.workout.count({
                where: { userId, endedAt: { not: null } }
            }),
            prisma.workoutSet.aggregate({
                where: { workout: { userId } },
                _sum: { weight: true } // Simplified volume calculation (weight * reps would be better but requires raw query or JS calc)
            })
        ]);

        // Calculate real volume (weight * reps)
        // Since aggregate doesn't support multiplication, we might need to fetch sets or do raw SQL.
        // For now, let's fetch all sets for volume calc (might be heavy for large data, but okay for MVP)
        const allSets = await prisma.workoutSet.findMany({
            where: { workout: { userId } },
            select: { weight: true, reps: true }
        });

        const realVolume = allSets.reduce((acc, set) => acc + (set.weight * set.reps), 0);

        res.json({
            totalWorkouts,
            totalVolume: realVolume,
            totalSets: allSets.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
