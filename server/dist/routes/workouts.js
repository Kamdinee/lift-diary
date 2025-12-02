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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../utils/db"));
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = express_1.default.Router();
const startWorkoutSchema = zod_1.z.object({
    routineId: zod_1.z.string().optional(),
    name: zod_1.z.string().optional()
});
const saveWorkoutSchema = zod_1.z.object({
    endedAt: zod_1.z.string().datetime(),
    duration: zod_1.z.number(),
    sets: zod_1.z.array(zod_1.z.object({
        exerciseId: zod_1.z.string(),
        seriesIndex: zod_1.z.number(),
        reps: zod_1.z.number(),
        weight: zod_1.z.number(),
        completed: zod_1.z.boolean()
    }))
});
// Start workout
router.post('/start', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId, name } = startWorkoutSchema.parse(req.body);
        const workout = yield db_1.default.workout.create({
            data: {
                userId: req.user.userId,
                routineId,
                name: name || 'Entraînement libre',
                startedAt: new Date()
            }
        });
        res.json(workout);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Save/Finish workout (Update)
router.put('/:id/finish', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { endedAt, duration, sets } = saveWorkoutSchema.parse(req.body);
        // Verify ownership
        const workout = yield db_1.default.workout.findUnique({ where: { id } });
        if (!workout || workout.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const updatedWorkout = yield db_1.default.workout.update({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get history
router.get('/history', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workouts = yield db_1.default.workout.findMany({
            where: {
                userId: req.user.userId,
                endedAt: { not: null }
            },
            orderBy: { startedAt: 'desc' },
            include: { sets: { include: { exercise: true } } }
        });
        res.json(workouts);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
