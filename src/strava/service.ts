import axios from 'axios';
import type { StravaTokenResponse, StravaActivity, SplitMetric } from './types.js';

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
  const accessToken = process.env.STRAVA_ACCESS_TOKEN!;
  
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
  
  return `**Latest Run Analysis - ${date}**

**Activity:** ${activity.name}
**Distance:** ${distanceKm} km
**Duration:** ${durationMin} minutes
**Average Pace:** ${paceDisplay} min/km
**Elevation Gain:** ${activity.total_elevation_gain}m
**Average Speed:** ${(activity.average_speed * 3.6).toFixed(1)} km/h${splitsSection}`;
}