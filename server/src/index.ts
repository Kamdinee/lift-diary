import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import exerciseRoutes from './routes/exercises';
import routineRoutes from './routes/routines';
import workoutRoutes from './routes/workouts';
import statsRoutes from './routes/stats';
import { syncExercises } from './services/exerciseService';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('LiftDiary API is running');
});

// Start server and sync exercises
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Initial sync on startup
    console.log('Starting initial exercise sync...');
    await syncExercises();

    // Schedule sync check daily
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily sync check...');
        await syncExercises();
    });
});
