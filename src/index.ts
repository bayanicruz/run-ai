import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activity.js';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'strava-coach-api' });
});

app.use('/', authRoutes);
app.use('/', activityRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port}/auth to start OAuth flow`);
});