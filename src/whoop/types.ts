export interface WhoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface WhoopRecovery {
  recovery_score: number;
}

export interface WhoopRunningWorkout {
  sport_id: number;
  zone_duration: {
    zone_zero_milli: number;
    zone_one_milli: number;
    zone_two_milli: number;
    zone_three_milli: number;
    zone_four_milli: number;
    zone_five_milli: number;
  };
  start: string;
  distance_meter: number;
}

