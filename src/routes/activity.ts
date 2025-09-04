import { Router } from 'express';
import { getLatestActivity, formatActivityForCoaching } from '../services/stravaService.js';

const router = Router();

router.get('/latest-activity', async (req, res) => {
  try {
    const activity = await getLatestActivity();
    
    if (!activity) {
      return res.status(404).json({ error: 'No activities found' });
    }
    
    if (activity.type !== 'Run') {
      return res.status(400).json({ error: 'Latest activity is not a run' });
    }
    
    const formattedText = formatActivityForCoaching(activity);
    
    res.json({
      formatted_text: formattedText
    });
    
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch latest activity' });
  }
});

export default router;