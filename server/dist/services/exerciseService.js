"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncExercises = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../utils/db"));
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const syncExercises = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if we need to sync
        const lastSyncedExercise = yield db_1.default.exercise.findFirst({
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
        const response = yield axios_1.default.request(options);
        const exercises = response.data;
        console.log(`Fetched ${exercises.length} exercises. Updating database...`);
        // Batch upsert is not directly supported in a simple way for massive data with logic, 
        // but we can use transaction or just loop for now since it's a background task.
        // For performance, we could use createMany but we want to update if exists.
        // Prisma doesn't have bulk upsert easily. 
        // We will use a transaction.
        // Mapping API data to our schema
        // API returns: { id, name, target, bodyPart, equipment, gifUrl, ... }
        const upsertOperations = exercises.map((ex) => {
            return db_1.default.exercise.upsert({
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
            yield db_1.default.$transaction(chunk);
        }
        console.log('Exercise sync completed successfully.');
    }
    catch (error) {
        console.error('Error syncing exercises:', error);
    }
});
exports.syncExercises = syncExercises;
