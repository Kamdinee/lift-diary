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
const createRoutineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    exercises: zod_1.z.array(zod_1.z.object({
        exerciseId: zod_1.z.string(),
        defaultSeries: zod_1.z.number().optional(),
        defaultReps: zod_1.z.number().optional(),
        defaultWeight: zod_1.z.number().optional()
    }))
});
// Get user routines
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routines = yield db_1.default.routine.findMany({
            where: { userId: req.user.userId },
            include: { exercises: { include: { exercise: true } } }
        });
        res.json(routines);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create routine
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, exercises } = createRoutineSchema.parse(req.body);
        const routine = yield db_1.default.routine.create({
            data: {
                name,
                userId: req.user.userId,
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
