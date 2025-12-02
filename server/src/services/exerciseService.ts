import axios from 'axios';
import prisma from '../utils/db';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

export const syncExercises = async () => {
    try {
        // Check if we need to sync
        const lastSyncedExercise = await prisma.exercise.findFirst({
            where: { apiSource: 'exercisedb' },
            orderBy: { lastSyncedAt: 'desc' }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastSyncedExercise && lastSyncedExercise.lastSyncedAt > thirtyDaysAgo) {
            console.log('Exercises are up to date. Skipping sync.');
            return;
        }

        console.log('Fetching exercises from ExerciseDB...');

        if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY') {
            console.warn('Missing RapidAPI Key. Skipping sync.');
            return;
        }

        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/exercises`,
            params: { limit: '1300' }, // Fetch all (approx 1300)
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        const exercises = response.data;

        console.log(`Fetched ${exercises.length} exercises. Updating database...`);

        // Batch upsert is not directly supported in a simple way for massive data with logic, 
        // but we can use transaction or just loop for now since it's a background task.
        // For performance, we could use createMany but we want to update if exists.
        // Prisma doesn't have bulk upsert easily. 
        // We will use a transaction.

        // Mapping API data to our schema
        // API returns: { id, name, target, bodyPart, equipment, gifUrl, ... }

        const upsertOperations = exercises.map((ex: any) => {
            return prisma.exercise.upsert({
                where: { id: ex.id },
                update: {
                    name: ex.name,
                    target: ex.target,
                    bodyPart: ex.bodyPart,
                    equipment: ex.equipment,
                    gifUrl: ex.gifUrl,
                    lastSyncedAt: new Date(),
                    apiSource: 'exercisedb'
                },
                create: {
                    id: ex.id,
                    name: ex.name,
                    target: ex.target,
                    bodyPart: ex.bodyPart,
                    equipment: ex.equipment,
                    gifUrl: ex.gifUrl,
                    lastSyncedAt: new Date(),
                    apiSource: 'exercisedb'
                }
            });
        });

        // Execute in chunks to avoid overwhelming the DB connection
        const chunkSize = 50;
        for (let i = 0; i < upsertOperations.length; i += chunkSize) {
            const chunk = upsertOperations.slice(i, i + chunkSize);
            await prisma.$transaction(chunk);
        }

        console.log('Exercise sync completed successfully.');

    } catch (error) {
        console.error('Error syncing exercises:', error);
    }
};
