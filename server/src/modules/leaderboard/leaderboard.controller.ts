import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService, Timeframe } from './leaderboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @CurrentUser() user: any,
    @Query('timeframe') timeframe: string = 'month',
  ) {
    const userId = user?._id?.toString() || user?.id || user?.sub;
    return this.leaderboardService.getLeaderboard(userId, (timeframe as Timeframe) || 'month');
  }
}
