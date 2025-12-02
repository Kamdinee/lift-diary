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
const router = express_1.default.Router();
router.get('/summary', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const [totalWorkouts, totalVolume] = yield Promise.all([
            db_1.default.workout.count({
                where: { userId, endedAt: { not: null } }
            }),
            db_1.default.workoutSet.aggregate({
                where: { workout: { userId } },
                _sum: { weight: true } // Simplified volume calculation (weight * reps would be better but requires raw query or JS calc)
            })
        ]);
        // Calculate real volume (weight * reps)
        // Since aggregate doesn't support multiplication, we might need to fetch sets or do raw SQL.
        // For now, let's fetch all sets for volume calc (might be heavy for large data, but okay for MVP)
        const allSets = yield db_1.default.workoutSet.findMany({
            where: { workout: { userId } },
            select: { weight: true, reps: true }
        });
        const realVolume = allSets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
        res.json({
            totalWorkouts,
            totalVolume: realVolume,
            totalSets: allSets.length
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
