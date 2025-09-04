import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import stravaAuthRoutes from './strava/routes/auth.js';
import whoopAuthRoutes from './whoop/routes/auth.js';
import stravaActivityRoutes from './strava/routes/activity.js';
import whoopActivityRoutes from './whoop/routes/activity.js';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'strava-coach-api' });
});

app.use('/', stravaAuthRoutes);
app.use('/', whoopAuthRoutes);
app.use('/', stravaActivityRoutes);
app.use('/', whoopActivityRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port}/auth/strava for Strava OAuth`);
  console.log(`Visit http://localhost:${port}/auth/whoop for Whoop OAuth`);
});