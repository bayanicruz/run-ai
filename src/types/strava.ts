export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
  splits_metric?: SplitMetric[];
}

export interface SplitMetric {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone: number;
}

export interface FormattedActivity {
  date: string;
  name: string;
  distance: string;
  duration: string;
  pace: string;
  elevation: string;
  averageSpeed: string;
}