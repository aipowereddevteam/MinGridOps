import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { ToggleHabitLogDto } from './dto/toggle-habit-log.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('habit-logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Get(':monthYear')
  async getLogsForMonth(
    @CurrentUser('_id') userId: any,
    @Param('monthYear') monthYear: string,
  ) {
    return this.habitLogsService.getLogsForMonth(userId.toString(), monthYear);
  }

  @Patch('toggle')
  async toggleLog(
    @CurrentUser('_id') userId: any,
    @Body() toggleDto: ToggleHabitLogDto,
  ) {
    return this.habitLogsService.toggleHabitLog(userId.toString(), toggleDto);
  }
}
