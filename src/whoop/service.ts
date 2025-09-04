import axios from 'axios';
import type { WhoopTokenResponse, WhoopRecovery, WhoopRunningWorkout } from './types.js';

const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v2';
const WHOOP_AUTH_BASE = 'https://api.prod.whoop.com/oauth';
const RUNNING_SPORT_ID = 0;

export function generateAuthUrl(redirectUri: string): string {
  const clientId = process.env.WHOOP_CLIENT_ID!;
  const scope = 'read:recovery read:workout';
  return `${WHOOP_AUTH_BASE}/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=whoop_auth`;
}

export async function exchangeCodeForToken(code: string): Promise<WhoopTokenResponse> {
  const redirectUri = `http://localhost:${process.env.PORT || 3000}/callback/whoop`;
  
  const params = new URLSearchParams();
  params.append('client_id', process.env.WHOOP_CLIENT_ID!);
  params.append('client_secret', process.env.WHOOP_CLIENT_SECRET!);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', redirectUri);
  
  const response = await axios.post('https://api.prod.whoop.com/oauth/oauth2/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return response.data;
}

export async function getCurrentRecoveryScore(): Promise<number | null> {
  const accessToken = process.env.WHOOP_ACCESS_TOKEN!;
  
  try {
    const recoveryResponse = await axios.get(`${WHOOP_API_BASE}/recovery`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 1
      }
    });
    
    const recoveries = recoveryResponse.data.data || recoveryResponse.data;
    if (!recoveries.length) return null;
    
    const latestRecovery = recoveries[0];
    return latestRecovery.score?.recovery_score || latestRecovery.recovery_score || null;
  } catch (error) {
    console.error('Failed to fetch recovery score:', error);
    return null;
  }
}

export async function getLatestRunningWorkout(): Promise<WhoopRunningWorkout | null> {
  const accessToken = process.env.WHOOP_ACCESS_TOKEN!;
  
  try {
    const workoutResponse = await axios.get(`${WHOOP_API_BASE}/workout`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 50
      }
    });
    
    const workouts: WhoopRunningWorkout[] = workoutResponse.data.data || workoutResponse.data;
    const runningWorkout = workouts.find(workout => workout.sport_id === RUNNING_SPORT_ID);
    
    return runningWorkout || null;
  } catch (error) {
    console.error('Failed to fetch running workout:', error);
    return null;
  }
}

export function formatRecoveryData(recoveryScore: number): string {
  const status = recoveryScore >= 67 ? 'Green' : recoveryScore >= 34 ? 'Yellow' : 'Red';
  return `**Today's Recovery: ${recoveryScore}% (${status})**`;
}

export function formatHeartRateZones(workout: WhoopRunningWorkout): string {
  if (!workout.zone_duration) return 'No heart rate zone data available';
  
  const zones = workout.zone_duration;
  const totalTime = Object.values(zones).reduce((sum, duration) => sum + duration, 0);
  
  if (totalTime === 0) return 'No heart rate zone data available';
  
  const formatZone = (zoneName: string, duration: number): string => {
    const minutes = Math.round(duration / 60000);
    const percentage = ((duration / totalTime) * 100).toFixed(1);
    return `${zoneName}: ${minutes}min (${percentage}%)`;
  };
  
  const date = new Date(workout.start).toLocaleDateString();
  const distance = (workout.distance_meter / 1000).toFixed(2);
  
  return `**Latest Running Workout - ${date}**
**Distance:** ${distance} km

**Heart Rate Zones:**
${formatZone('Zone 1', zones.zone_one_milli)}
${formatZone('Zone 2', zones.zone_two_milli)}
${formatZone('Zone 3', zones.zone_three_milli)}
${formatZone('Zone 4', zones.zone_four_milli)}
${formatZone('Zone 5', zones.zone_five_milli)}`;
}