import { Router } from 'express';
import { getLatestActivity, formatActivityForCoaching, getActivityStreams, processPaceSpeedData, formatPaceSpeedForAI } from '../service.js';

const router = Router();

router.get('/strava/latest-activity', async (req, res) => {
  try {
    const activity = await getLatestActivity();
    
    if (!activity) {
      return res.status(404).json({ error: 'No activities found' });
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


router.get('/strava/latest-activity/pace-speed', async (req, res) => {
  try {
    const activity = await getLatestActivity();
    const format = req.query.format as string;
    
    if (!activity) {
      return res.status(404).json({ error: 'No activities found' });
    }
    
    const streams = await getActivityStreams(activity.id);
    
    if (!streams) {
      return res.status(404).json({ error: 'Activity streams not found' });
    }
    
    const paceSpeedData = processPaceSpeedData(streams);
    
    if (!paceSpeedData) {
      return res.status(404).json({ error: 'Pace/speed data not available for this activity' });
    }
    
    if (format === 'formatted') {
      const formattedText = formatPaceSpeedForAI(paceSpeedData, activity);
      return res.json({
        activity_id: activity.id,
        activity_name: activity.name,
        activity_type: activity.type,
        formatted_text: formattedText
      });
    }
    
    res.json({
      activity_id: activity.id,
      activity_name: activity.name,
      activity_type: activity.type,
      pace_speed_data: paceSpeedData
    });
    
  } catch (error) {
    console.error('Error fetching latest activity pace/speed data:', error);
    res.status(500).json({ error: 'Failed to fetch pace/speed data' });
  }
});

router.get('/text/strava/latest-activity/pace-speed', async (req, res) => {
  try {
    const activity = await getLatestActivity();
    
    if (!activity) {
      return res.status(404).send('No activities found');
    }
    
    const streams = await getActivityStreams(activity.id);
    
    if (!streams) {
      return res.status(404).send('Activity streams not found');
    }
    
    const paceSpeedData = processPaceSpeedData(streams);
    
    if (!paceSpeedData) {
      return res.status(404).send('Pace/speed data not available for this activity');
    }
    
    const formattedText = formatPaceSpeedForAI(paceSpeedData, activity);
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(formattedText);
    
  } catch (error) {
    console.error('Error fetching latest activity pace/speed data:', error);
    res.status(500).send('Failed to fetch pace/speed data');
  }
});

router.get('/text/strava/latest-activity', async (req, res) => {
  try {
    const activity = await getLatestActivity();
    
    if (!activity) {
      return res.status(404).send('No activities found');
    }
    
    const formattedText = formatActivityForCoaching(activity);
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(formattedText);
    
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).send('Failed to fetch latest activity');
  }
});

export default router;