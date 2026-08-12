import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HabitLog, HabitLogDocument } from '../habit-logs/schemas/habit-log.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

export type Timeframe = 'today' | 'week' | 'month' | 'quarter' | 'year';

const DEFAULT_31_ZERO_BITS = '0000000000000000000000000000000';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(HabitLog.name) private readonly habitLogModel: Model<HabitLogDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Helper to count '1' bits in a string between startIndex and endIndex (inclusive)
   */
  private countBitsInString(str: string = DEFAULT_31_ZERO_BITS, startIdx: number, endIdx: number): number {
    const padded = (str || DEFAULT_31_ZERO_BITS).padEnd(31, '0');
    let count = 0;
    const end = Math.min(endIdx, padded.length - 1);
    for (let i = Math.max(0, startIdx); i <= end; i++) {
      if (padded[i] === '1') {
        count++;
      }
    }
    return count;
  }

  async getLeaderboard(currentUserId: string, timeframe: Timeframe = 'month') {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNumber = now.getMonth() + 1; // 1-indexed
    const currentDayNumber = now.getDate(); // 1-indexed

    const currentMonthStr = `${currentYear}-${String(currentMonthNumber).padStart(2, '0')}`;

    // Get all active users (include users where isActive is true or unset/not false)
    const activeUsers = await this.userModel
      .find({ isActive: { $ne: false } })
      .select('name email avatar role')
      .lean();

    // Determine filter criteria and calculation bounds based on timeframe
    let targetMonthYears: string[] = [currentMonthStr];
    let calculateScoreForLog: (log: HabitLogDocument) => number;

    if (timeframe === 'today') {
      const todayIdx = currentDayNumber - 1;
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, todayIdx, todayIdx);
    } else if (timeframe === 'week') {
      const startDayIdx = Math.max(0, currentDayNumber - 7);
      const endDayIdx = currentDayNumber - 1;
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, startDayIdx, endDayIdx);
    } else if (timeframe === 'month') {
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, 0, 30);
    } else if (timeframe === 'quarter') {
      const currentQuarter = Math.floor((currentMonthNumber - 1) / 3) + 1;
      const quarterStartMonth = (currentQuarter - 1) * 3 + 1;
      targetMonthYears = [0, 1, 2].map((offset) => {
        const m = quarterStartMonth + offset;
        return `${currentYear}-${String(m).padStart(2, '0')}`;
      });
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, 0, 30);
    } else if (timeframe === 'year') {
      targetMonthYears = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return `${currentYear}-${String(m).padStart(2, '0')}`;
      });
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, 0, 30);
    } else {
      calculateScoreForLog = (log) =>
        this.countBitsInString(log.completionString, 0, 30);
    }

    // Query logs for relevant monthYears
    const logs = await this.habitLogModel
      .find({ monthYear: { $in: targetMonthYears } })
      .lean();

    // Map scores per user ID
    const userScoreMap: Record<string, number> = {};
    activeUsers.forEach((u) => {
      userScoreMap[u._id.toString()] = 0;
    });

    logs.forEach((log: any) => {
      const uId = log.userId?.toString();
      if (uId && userScoreMap[uId] !== undefined) {
        userScoreMap[uId] += calculateScoreForLog(log);
      }
    });

    // Build ranked list
    const rankedUsers = activeUsers
      .map((u) => {
        const userIdStr = u._id.toString();
        return {
          userId: userIdStr,
          name: u.name,
          email: u.email,
          avatar: u.avatar || '',
          score: userScoreMap[userIdStr] || 0,
        };
      })
      .sort((a, b) => b.score - a.score);

    // Assign rank numbers
    const leaderboardList = rankedUsers.map((u, index) => ({
      rank: index + 1,
      ...u,
    }));

    const topUsers = leaderboardList.slice(0, 5);

    const currentUserEntry = leaderboardList.find((u) => u.userId === currentUserId) || {
      rank: leaderboardList.length + 1,
      userId: currentUserId,
      name: 'You',
      email: '',
      avatar: '',
      score: 0,
    };

    return {
      timeframe,
      topUsers,
      allUsers: leaderboardList,
      currentUserRank: currentUserEntry,
      totalParticipants: leaderboardList.length,
    };
  }
}
