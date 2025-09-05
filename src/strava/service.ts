import axios from 'axios';
import type { StravaTokenResponse, StravaActivity, SplitMetric, ActivityStreams, PaceSpeedData } from './types.js';
import { getStravaToken } from '../tokenCache.js';

export function generateAuthUrl(redirectUri: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID!;
  const scope = 'activity:read_all';
  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&approval_prompt=force`;
}

export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code'
  });
  
  return response.data;
}

export async function getLatestActivity(): Promise<StravaActivity | null> {
  const accessToken = getStravaToken();
  if (!accessToken) return null;
  
  const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    params: {
      per_page: 1,
      page: 1
    }
  });
  
  const activities: StravaActivity[] = response.data;
  const activity = activities[0];
  
  if (!activity) return null;
  
  // Fetch detailed activity data including splits
  const detailedResponse = await axios.get(`https://www.strava.com/api/v3/activities/${activity.id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return detailedResponse.data;
}

function formatSplits(splits: SplitMetric[]): string {
  if (!splits || splits.length === 0) return 'No splits data available';
  
  return splits.map(split => {
    const paceMinPerKm = (split.moving_time / 60) / (split.distance / 1000);
    const pace = `${Math.floor(paceMinPerKm)}:${String(Math.round((paceMinPerKm % 1) * 60)).padStart(2, '0')}`;
    const elevation = split.elevation_difference > 0 ? `+${split.elevation_difference}m` : `${split.elevation_difference}m`;
    return `Km ${split.split}: ${pace} min/km (${elevation})`;
  }).join('\n');
}

export function formatActivityForCoaching(activity: StravaActivity): string {
  const date = new Date(activity.start_date).toLocaleDateString();
  const distanceKm = (activity.distance / 1000).toFixed(2);
  const durationMin = Math.round(activity.moving_time / 60);
  const paceMinPerKm = (activity.moving_time / 60) / (activity.distance / 1000);
  const paceDisplay = `${Math.floor(paceMinPerKm)}:${String(Math.round((paceMinPerKm % 1) * 60)).padStart(2, '0')}`;
  
  const splitsSection = activity.splits_metric ? `\n**Splits:**\n${formatSplits(activity.splits_metric)}` : '';
  
  return `**Latest ${activity.type} Analysis - ${date}**

**Activity:** ${activity.name}
**Distance:** ${distanceKm} km
**Duration:** ${durationMin} minutes
**Average Pace:** ${paceDisplay} min/km
**Elevation Gain:** ${activity.total_elevation_gain}m
**Average Speed:** ${(activity.average_speed * 3.6).toFixed(1)} km/h${splitsSection}`;
}

export async function getActivityStreams(activityId: number): Promise<ActivityStreams | null> {
  const accessToken = getStravaToken();
  if (!accessToken) return null;
  
  const streamTypes = ['time', 'distance', 'velocity_smooth', 'altitude', 'heartrate'];
  
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/activities/${activityId}/streams`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        keys: streamTypes.join(','),
        key_by_type: true
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activity streams:', error);
    return null;
  }
}

export function processPaceSpeedData(streams: ActivityStreams): PaceSpeedData | null {
  if (!streams.time || !streams.distance || !streams.velocity_smooth) {
    return null;
  }
  
  const timeData = streams.time.data;
  const distanceData = streams.distance.data;
  const speedData = streams.velocity_smooth.data;
  
  const paceData = speedData.map(speed => {
    if (speed === 0) return 0;
    return (1000 / speed) / 60;
  });
  
  return {
    time_points: timeData,
    distance_points: distanceData.map(d => d / 1000),
    speed_data: speedData.map(s => s * 3.6),
    pace_data: paceData
  };
}

export function formatPaceSpeedForAI(data: PaceSpeedData, activity?: StravaActivity): string {
  const totalTime = Math.max(...data.time_points);
  const totalDistance = Math.max(...data.distance_points);
  const avgSpeed = data.speed_data.reduce((a, b) => a + b, 0) / data.speed_data.length;
  const avgPace = data.pace_data.filter(p => p > 0).reduce((a, b) => a + b, 0) / data.pace_data.filter(p => p > 0).length;
  
  const minSpeed = Math.min(...data.speed_data.filter(s => s > 0));
  const maxSpeed = Math.max(...data.speed_data);
  const minPace = Math.min(...data.pace_data.filter(p => p > 0));
  const maxPace = Math.max(...data.pace_data.filter(p => p > 0));
  
  const formatPaceDisplay = (pace: number) => `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}`;
  
  // Sample key data points (every 10% of activity)
  const samplePoints: string[] = [];
  for (let i = 0; i < 10; i++) {
    const index = Math.floor((data.time_points.length / 10) * i);
    if (index < data.time_points.length) {
      const time = Math.round(data.time_points[index] / 60);
      const distance = data.distance_points[index].toFixed(1);
      const speed = data.speed_data[index].toFixed(1);
      const pace = formatPaceDisplay(data.pace_data[index]);
      samplePoints.push(`${time}min (${distance}km): ${speed}km/h, ${pace}/km`);
    }
  }
  
  const activityName = activity?.name;
  const activityType = activity?.type;
  const movingTime = activity?.moving_time;
  const movingSpeed = activity?.average_speed ? activity.average_speed * 3.6 : null;
  
  return `**${activityType || 'Activity'} Pace/Speed Analysis${activityName ? ` - ${activityName}` : ''}**

**Summary:**
- Total Distance: ${totalDistance.toFixed(2)} km
- Elapsed Time: ${Math.floor(totalTime / 60)}:${String(Math.round(totalTime % 60)).padStart(2, '0')}${movingTime ? `\n- Moving Time: ${Math.floor(movingTime / 60)}:${String(movingTime % 60).padStart(2, '0')}` : ''}
- Stream Avg Speed: ${avgSpeed.toFixed(1)} km/h${movingSpeed ? `\n- Activity Avg Speed: ${movingSpeed.toFixed(1)} km/h` : ''}
- Stream Avg Pace: ${formatPaceDisplay(avgPace)} min/km

**Performance Range:**
- Speed: ${minSpeed.toFixed(1)} - ${maxSpeed.toFixed(1)} km/h
- Pace: ${formatPaceDisplay(maxPace)} - ${formatPaceDisplay(minPace)} min/km

**Key Data Points (Time, Distance, Speed, Pace):**
${samplePoints.join('\n')}

**Data Points Available:** ${data.time_points.length} measurements for detailed analysis

**Note:** This data can be used to analyze pacing strategy, identify fatigue patterns, analyze splits, and provide coaching insights.`;
}