export interface Rank {
  min: number;
  max: number;
  name: string;
  color: string;
}
export interface UserData {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  stats: {
    overall: {
      rating: number;
      wins: number;
      losses: number;
    };
    topics?: Record<string, { rating: number }>;
  };
  matches?: any[]; // Using any[] for now or define a Match interface
  ratingHistory?: any[]; // Using any[] for now or define a RatingPoint interface
}
export interface RankInfo {
  rank: Rank;
  nextRank: Rank | undefined;
  progress: number;
  pointsToNext: number;
}
