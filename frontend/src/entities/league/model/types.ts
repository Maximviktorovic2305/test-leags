export type LeagueCode = "GREEN" | "BLUE";

export type LeaderboardEntry = {
  id: string;
  nickname: string;
  points: number;
  rank: number;
  isTopThree: boolean;
  isCurrent: boolean;
};

export type Leaderboard = {
  league: LeagueCode;
  title: string;
  promotionPlaces: number;
  entries: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
};

export type LeagueRecalculation = {
  recalculatedAt: string;
  promoted: Array<{
    userId: string;
    nickname: string;
    fromLeague: LeagueCode;
    toLeague: LeagueCode;
    rank: number;
  }>;
};
