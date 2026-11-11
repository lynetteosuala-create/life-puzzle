export type LifeDomain = 
  | 'mind'
  | 'relationships'
  | 'goals'
  | 'money'
  | 'learning'
  | 'growth'
  | 'happiness';

export interface DomainMeta {
  id: LifeDomain;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  lightBg: string;
  textColor: string;
}

export interface PuzzlePiece {
  id: string;
  domain: LifeDomain;
  title: string;
  skillName: string;
  summary: string;
  fullWisdom: string;
  actionPrompt: string;
  position: { x: number; y: number; slotIndex: number };
  unlocked: boolean;
  placedOnBoard: boolean;
  tier: 1 | 2 | 3; // 1: Foundation, 2: Catalyst, 3: Mastery
  gemCost?: number;
  xpValue: number;
  dateUnlocked?: string;
}

export interface DailyQuest {
  id: string;
  domain: LifeDomain;
  title: string;
  durationMinutes: number;
  description: string;
  actionTip: string;
  rewardXP: number;
  rewardGems: number;
  pieceRewardId?: string;
  completed: boolean;
}

export interface LifeDilemma {
  id: string;
  domain: LifeDomain;
  title: string;
  context: string;
  choices: {
    id: string;
    text: string;
    philosophy: string;
    xpGained: number;
    consequence: string;
    puzzlePieceRewardId?: string;
  }[];
}

export interface MilestoneReward {
  id: string;
  dayThreshold: number;
  title: string;
  description: string;
  rewardType: 'gems' | 'special_piece' | 'theme' | 'shield';
  claimed: boolean;
  icon: string;
}

export interface LinkPreviewMetadata {
  url: string;
  originalUrl: string;
  title: string;
  description: string;
  image?: string;
  siteName: string;
  domain: string;
  favicon?: string;
  isSecure: boolean;
  isSuspicious: boolean;
  warningReason?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  fetchedAt?: string;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    level: number;
    badge: string;
  };
  content: string;
  domain: LifeDomain;
  links: string[];
  linkPreviews?: LinkPreviewMetadata[];
  likes: number;
  likedByMe?: boolean;
  commentsCount: number;
  timestamp: string;
  puzzlePieceEarned?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy' | 'aria';
  text: string;
  timestamp: string;
  links?: string[];
  linkPreviews?: LinkPreviewMetadata[];
}

export interface UserProgress {
  streak: number;
  streakFrozenToday: boolean;
  streakShields: number;
  lastActiveDate: string;
  xp: number;
  level: number;
  gems: number;
  placedPiecesCount: number;
  unlockedPiecesCount: number;
  completedQuestsToday: string[];
}
