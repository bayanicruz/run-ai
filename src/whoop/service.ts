import axios from 'axios';
import type { WhoopTokenResponse, WhoopRecovery, WhoopRunningWorkout } from './types.js';
import { getWhoopToken } from '../tokenCache.js';

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
  const accessToken = getWhoopToken();
  console.log('Using access token:', accessToken ? 'Token found' : 'No token');
  if (!accessToken) return null;
  
  try {
    const recoveryResponse = await axios.get(`${WHOOP_API_BASE}/recovery`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 1
      }
    });
    
    console.log('Recovery API response:', JSON.stringify(recoveryResponse.data, null, 2));
    
    const recoveries = recoveryResponse.data.records || recoveryResponse.data.data || recoveryResponse.data;
    if (!recoveries.length) return null;
    
    const latestRecovery = recoveries[0];
    return latestRecovery.score?.recovery_score || null;
  } catch (error) {
    console.error('Failed to fetch recovery score:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

export async function getLatestWorkout(): Promise<any> {
  const accessToken = getWhoopToken();
  if (!accessToken) return null;
  
  try {
    const workoutResponse = await axios.get(`${WHOOP_API_BASE}/activity/workout`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 10
      }
    });
    
    const workouts = workoutResponse.data.records || workoutResponse.data;
    
    if (!workouts.length) {
      return null;
    }
    
    const latestWorkout = workouts[0];
    
    // Get detailed workout data by ID
    const detailResponse = await axios.get(`${WHOOP_API_BASE}/activity/workout/${latestWorkout.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Workout detail response:', JSON.stringify(detailResponse.data, null, 2));
    
    return detailResponse.data;
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

export function formatRecoveryData(recoveryScore: number): string {
  const status = recoveryScore >= 67 ? 'Green' : recoveryScore >= 34 ? 'Yellow' : 'Red';
  return `**Today's Recovery: ${recoveryScore}% (${status})**`;
}

export function formatHeartRateZones(workout: any): string {
  if (!workout.score?.zone_durations) return 'No heart rate zone data available';
  
  const zones = workout.score.zone_durations;
  const totalTime = Object.values(zones).reduce((sum: number, duration: number) => sum + duration, 0);
  
  if (totalTime === 0) return 'No heart rate zone data available';
  
  const formatZone = (zoneName: string, duration: number): string => {
    const minutes = Math.round(duration / 60000);
    const percentage = ((duration / totalTime) * 100).toFixed(1);
    return `${zoneName}: ${minutes}min (${percentage}%)`;
  };
  
  const date = new Date(workout.start).toLocaleDateString();
  const distance = workout.score.distance_meter ? (workout.score.distance_meter / 1000).toFixed(2) : 'N/A';
  const sportName = workout.sport_name || 'Workout';
  
  return `**Latest ${sportName} - ${date}**
**Distance:** ${distance} km
**Strain:** ${workout.score.strain}
**Avg HR:** ${workout.score.average_heart_rate} bpm

**Heart Rate Zones:**
${formatZone('Zone 1', zones.zone_one_milli)}
${formatZone('Zone 2', zones.zone_two_milli)}
${formatZone('Zone 3', zones.zone_three_milli)}
${formatZone('Zone 4', zones.zone_four_milli)}
${formatZone('Zone 5', zones.zone_five_milli)}`;
}