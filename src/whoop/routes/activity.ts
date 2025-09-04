import { Router } from 'express';
import { getCurrentRecoveryScore, getLatestWorkout, formatRecoveryData, formatHeartRateZones } from '../service.js';

const router = Router();

router.get('/whoop/recovery', async (req, res) => {
  try {
    const recoveryScore = await getCurrentRecoveryScore();
    
    console.log('Recovery score returned from service:', recoveryScore);
    
    if (recoveryScore === null) {
      return res.status(404).json({ error: 'No recovery data found' });
    }
    
    const formattedText = formatRecoveryData(recoveryScore);
    
    res.json({
      formatted_text: formattedText,
      recovery_score: recoveryScore
    });
    
  } catch (error) {
    console.error('Error fetching recovery:', error);
    res.status(500).json({ error: 'Failed to fetch recovery data' });
  }
});

router.get('/whoop/latest', async (req, res) => {
  try {
    const workout = await getLatestWorkout();
    
    if (!workout) {
      return res.status(404).json({ error: 'No workouts found' });
    }
    
    const formattedText = formatHeartRateZones(workout);
    
    res.json({
      formatted_text: formattedText
    });
    
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch latest running workout' });
  }
});

export default router;