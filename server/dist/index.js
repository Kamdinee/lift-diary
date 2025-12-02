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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const exercises_1 = __importDefault(require("./routes/exercises"));
const routines_1 = __importDefault(require("./routes/routines"));
const workouts_1 = __importDefault(require("./routes/workouts"));
const stats_1 = __importDefault(require("./routes/stats"));
const exerciseService_1 = require("./services/exerciseService");
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/exercises', exercises_1.default);
app.use('/api/routines', routines_1.default);
app.use('/api/workouts', workouts_1.default);
app.use('/api/stats', stats_1.default);
// Health check
app.get('/', (req, res) => {
    res.send('LiftDiary API is running');
});
// Start server and sync exercises
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server running on port ${PORT}`);
    // Initial sync on startup
    console.log('Starting initial exercise sync...');
    yield (0, exerciseService_1.syncExercises)();
    // Schedule sync check daily
    node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Running daily sync check...');
        yield (0, exerciseService_1.syncExercises)();
    }));
}));
